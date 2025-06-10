import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HopitalService } from '../../../services/hopital.service';
import { RegionService } from '../../../services/region.service';
import { Hopital } from '../../../models/hopital.model';
import { Region } from '../../../models/region.model';
import { Province } from '../../../models/province.model';
import { Prefecture } from '../../../models/prefecture.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ajouter-hopital',
  templateUrl: './ajouter.component.html',
  styleUrls: ['./ajouter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class AjouterHopitalComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  currentId: number | null = null;

  // Nouvelles propriétés
  regions: Region[] = [];
  provinces: Province[] = [];
  prefectures: Prefecture[] = [];
  selectedLocationType: 'province' | 'prefecture' | null = null;

  constructor(
    private fb: FormBuilder,
    private hopitalService: HopitalService,
    private regionService: RegionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      regionId: ['', Validators.required],
      locationType: [''], // province ou prefecture
      provinceId: [''],
      prefectureId: ['']
    });
  }

  ngOnInit(): void {
    // Charger les régions
    this.loadRegions();

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentId = +params['id'];
        this.loadHopital(this.currentId);
      }
    });

    // Écouter les changements de région
    this.form.get('regionId')?.valueChanges.subscribe(regionId => {
      if (regionId) {
        this.resetLocationData();
      }
    });

    // Écouter les changements de type de localisation
    this.form.get('locationType')?.valueChanges.subscribe(type => {
      this.selectedLocationType = type;
      this.resetLocationSelections();

      const regionId = this.form.get('regionId')?.value;
      if (regionId && type === 'province') {
        this.loadProvinces(regionId);
      } else if (regionId && type === 'prefecture') {
        this.loadPrefectures(regionId);
      }
    });
  }

  loadRegions(): void {
    this.regionService.getRegions().subscribe(regions => {
      this.regions = regions;
    });
  }

  loadProvinces(regionId: number): void {
    this.regionService.getProvincesByRegion(regionId).subscribe(provinces => {
      this.provinces = provinces;
    });
  }

  loadPrefectures(regionId: number): void {
    this.regionService.getPrefecturesByRegion(regionId).subscribe(prefectures => {
      this.prefectures = prefectures;
    });
  }

  resetLocationData(): void {
    this.form.patchValue({
      locationType: null,
      provinceId: null,
      prefectureId: null
    });
    this.provinces = [];
    this.prefectures = [];
    this.selectedLocationType = null;
  }

  resetLocationSelections(): void {
    this.form.patchValue({
      provinceId: null,
      prefectureId: null
    });
  }

  loadHopital(id: number): void {
    this.hopitalService.getHopitaux().subscribe(hopitaux => {
      const hopital = hopitaux.find(h => h.idHopital === id);
      if (hopital) {
        // Trouver la région correspondante
        this.regionService.getRegions().subscribe(regions => {
          const region = regions.find(r => r.nom === hopital.region);
          if (region) {
            // Déterminer si c'est une province ou une préfecture
            if (hopital.province) {
              this.form.patchValue({
                nom: hopital.nom,
                adresse: hopital.adresse,
                regionId: region.idRegion,
                locationType: 'province'
              });

              // Charger les provinces et sélectionner la bonne
              this.regionService.getProvincesByRegion(region.idRegion).subscribe(provinces => {
                this.provinces = provinces;
                const province = provinces.find(p => p.nom === hopital.province);
                if (province) {
                  this.form.patchValue({ provinceId: province.idProvince });
                }
              });
            } else if (hopital.prefecture) {
              this.form.patchValue({
                nom: hopital.nom,
                adresse: hopital.adresse,
                regionId: region.idRegion,
                locationType: 'prefecture'
              });

              // Charger les préfectures et sélectionner la bonne
              this.regionService.getPrefecturesByRegion(region.idRegion).subscribe(prefectures => {
                this.prefectures = prefectures;
                const prefecture = prefectures.find(p => p.nom === hopital.prefecture);
                if (prefecture) {
                  this.form.patchValue({ prefectureId: prefecture.idPrefecture });
                }
              });
            } else {
              // Juste la région
              this.form.patchValue({
                nom: hopital.nom,
                adresse: hopital.adresse,
                regionId: region.idRegion
              });
            }
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Récupérer les valeurs du formulaire
      const formValues = this.form.value;

      // Trouver les noms correspondants aux IDs
      const region = this.regions.find(r => r.idRegion === +formValues.regionId);
      let province = null;
      let prefecture = null;

      if (formValues.locationType === 'province' && formValues.provinceId) {
        province = this.provinces.find(p => p.idProvince === +formValues.provinceId);
      } else if (formValues.locationType === 'prefecture' && formValues.prefectureId) {
        prefecture = this.prefectures.find(p => p.idPrefecture === +formValues.prefectureId);
      }

      // Créer l'objet hôpital
      const hopital: Hopital = {
        idHopital: this.isEditMode && this.currentId ? this.currentId : 0,
        nom: formValues.nom,
        adresse: formValues.adresse,
        region: region ? region.nom : '',
        province: province ? province.nom : null,
        prefecture: prefecture ? prefecture.nom : null
      };

      if (this.isEditMode && this.currentId) {
        // Mettre à jour l'hôpital existant
        this.hopitalService.updateHopital(hopital).subscribe(() => {
          this.router.navigate(['/hopitaux']);
        });
      } else {
        // Créer un nouvel hôpital
        this.hopitalService.createHopital(hopital).subscribe(() => {
          this.router.navigate(['/hopitaux']);
        });
      }
    }
  }
}
