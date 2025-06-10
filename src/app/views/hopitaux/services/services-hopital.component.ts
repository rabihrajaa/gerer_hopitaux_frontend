import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { HopitalService } from '../../../services/hopital.service';
import { ServiceService } from '../../../services/service.service';
import { Service, SousService } from '../../../models/service.model';
import { Hopital } from '../../../models/hopital.model';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-services-hopital',
  templateUrl: './services-hopital.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconDirective]
})
export class ServicesHopitalComponent implements OnInit, AfterViewInit {
  hopitalId: number | null = null;
  hopital: Hopital | null = null;
  services: Service[] = [];
  expandedServices: number[] = [];
  
  serviceForm: FormGroup;
  sousServiceForm: FormGroup;
  editingService: Service | null = null;
  editingSousService: SousService | null = null;
  currentServiceId: number | null = null;
  serviceModal: Modal | null = null;
  sousServiceModal: Modal | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hopitalService: HopitalService,
    private serviceService: ServiceService,
    private fb: FormBuilder
  ) {
    this.serviceForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.sousServiceForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.hopitalId = +params['id'];
        this.loadHopital();
        this.loadServices();
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialiser les modals Bootstrap
    const serviceModalEl = document.getElementById('serviceModal');
    const sousServiceModalEl = document.getElementById('sousServiceModal');

    if (serviceModalEl) {
      this.serviceModal = new Modal(serviceModalEl);
    }

    if (sousServiceModalEl) {
      this.sousServiceModal = new Modal(sousServiceModalEl);
    }
  }

  loadHopital(): void {
    if (!this.hopitalId) return;
    
    this.hopitalService.getHopital(this.hopitalId).subscribe(
      data => {
        this.hopital = data;
      },
      error => {
        console.error('Erreur lors du chargement de l\'hôpital:', error);
      }
    );
  }

  loadServices(): void {
    if (!this.hopitalId) return;
    
    this.serviceService.getServicesByHopital(this.hopitalId).subscribe(
      data => {
        this.services = data;
        // Charger les sous-services pour chaque service
        this.services.forEach(service => {
          if (service.idService) {
            this.serviceService.getSousServicesByService(service.idService).subscribe(sousServices => {
              service.sousServicesDTO = sousServices;
            });
          }
        });
      },
      error => {
        console.error('Erreur lors du chargement des services:', error);
      }
    );
  }

  toggleSousServices(serviceId: number): void {
    if (this.expandedServices.includes(serviceId)) {
      this.expandedServices = this.expandedServices.filter(id => id !== serviceId);
    } else {
      this.expandedServices.push(serviceId);
    }
  }

  openServiceModal(): void {
    this.editingService = null;
    this.serviceForm.reset();
    this.serviceModal?.show();
  }

  openServiceEditModal(service: Service): void {
    this.editingService = service;
    this.serviceForm.patchValue({
      nom: service.nom,
      description: service.description
    });
    this.serviceModal?.show();
  }

  openSousServiceModal(service: Service): void {
    this.editingSousService = null;
    this.currentServiceId = service.idService || null;
    this.sousServiceForm.reset();
    this.sousServiceModal?.show();
  }

  openSousServiceEditModal(serviceId: number, sousService: SousService): void {
    this.editingSousService = sousService;
    this.currentServiceId = serviceId;
    this.sousServiceForm.patchValue({
      nom: sousService.nom,
      description: sousService.description
    });
    this.sousServiceModal?.show();
  }

  saveService(): void {
    if (this.serviceForm.invalid || !this.hopitalId) return;

    const serviceData: Service = {
      ...this.serviceForm.value,
      hopital: {
        idHopital: this.hopitalId
      }
    };

    if (this.editingService && this.editingService.idService) {
      // Mise à jour d'un service existant
      serviceData.idService = this.editingService.idService;
      this.serviceService.updateService(serviceData).subscribe(() => {
        this.loadServices();
        this.serviceModal?.hide();
      });
    } else {
      // Création d'un nouveau service
      this.serviceService.createService(serviceData).subscribe(() => {
        this.loadServices();
        this.serviceModal?.hide();
      });
    }
  }

  saveSousService(): void {
    if (this.sousServiceForm.invalid || !this.currentServiceId) return;

    const sousServiceData: SousService = {
      ...this.sousServiceForm.value,
      service: {
        idService: this.currentServiceId
      }
    };

    if (this.editingSousService && this.editingSousService.idSousService) {
      // Mise à jour d'un sous-service existant
      sousServiceData.idSousService = this.editingSousService.idSousService;
      
      // Trouver le service parent
      const service = this.services.find(s => s.idService === this.currentServiceId);
      if (service && service.sousServicesDTO) {
        // Mettre à jour le sous-service dans le tableau local
        const index = service.sousServicesDTO.findIndex(ss => ss.idSousService === sousServiceData.idSousService);
        if (index !== -1) {
          service.sousServicesDTO[index] = sousServiceData;
        }
      }
      
      // Mettre à jour le service avec les sous-services mis à jour
      this.serviceService.updateService({
        idService: this.currentServiceId,
        nom: service?.nom || '',
        description: service?.description || '',
        sousServicesDTO: service?.sousServicesDTO
      }).subscribe(() => {
        this.loadServices();
        this.sousServiceModal?.hide();
      });
    } else {
      // Ajouter le sous-service au service
      const service = this.services.find(s => s.idService === this.currentServiceId);
      if (service) {
        if (!service.sousServicesDTO) {
          service.sousServicesDTO = [];
        }
        service.sousServicesDTO.push(sousServiceData);
        
        // Mettre à jour le service avec le nouveau sous-service
        this.serviceService.updateService({
          idService: this.currentServiceId,
          nom: service.nom,
          description: service.description,
          sousServicesDTO: service.sousServicesDTO
        }).subscribe(() => {
          this.loadServices();
          this.sousServiceModal?.hide();
        });
      }
    }
  }

  deleteService(serviceId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service et tous ses sous-services ?')) {
      this.serviceService.deleteService(serviceId).subscribe(() => {
        this.loadServices();
      });
    }
  }

  deleteSousService(serviceId: number, sousServiceId: number | undefined): void {
    if (!sousServiceId) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sous-service ?')) {
      // Trouver le service parent
      const service = this.services.find(s => s.idService === serviceId);
      if (service && service.sousServicesDTO) {
        // Supprimer le sous-service du tableau local
        service.sousServicesDTO = service.sousServicesDTO.filter(ss => ss.idSousService !== sousServiceId);
        
        // Mettre à jour le service avec les sous-services mis à jour
        this.serviceService.updateService({
          idService: serviceId,
          nom: service.nom,
          description: service.description,
          sousServicesDTO: service.sousServicesDTO
        }).subscribe(() => {
          this.loadServices();
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/hopitaux']);
  }
}