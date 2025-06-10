import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HopitalService } from '../../services/hopital.service';
import { RegionService } from '../../services/region.service';
import { Hopital } from '../../models/hopital.model';
import { Region } from '../../models/region.model';
import { Province } from '../../models/province.model';
import { Prefecture } from '../../models/prefecture.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-hopitaux',
  templateUrl: './hopitaux.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconDirective]
})
export class HopitauxComponent implements OnInit {
  hopitaux: Hopital[] = [];
  filteredHopitaux: Hopital[] = [];
  searchTerm = '';

  // Filtres
  regions: Region[] = [];
  provinces: Province[] = [];
  prefectures: Prefecture[] = [];
  selectedRegion: number | null = null;
  selectedProvince: number | null = null;
  selectedPrefecture: number | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  itemsPerPageOptions = [5, 10, 25, 50, 100];
  totalItems = 0;

  constructor(
    private hopitalService: HopitalService,
    private regionService: RegionService,
    private router: Router,
    private fb: FormBuilder,
    private iconSetService: IconSetService
  ) {}

  ngOnInit(): void {
    this.loadHopitaux();
    this.loadRegions();
  }

  loadHopitaux(): void {
    this.hopitalService.getHopitaux().subscribe(data => {
      this.hopitaux = data;
      this.applyFilters();
    });
  }

  loadRegions(): void {
    this.regionService.getRegions().subscribe(data => {
      this.regions = data;
    });
  }

  onRegionChange(regionId: number): void {
    this.selectedRegion = regionId;
    this.selectedProvince = null;
    this.selectedPrefecture = null;
    this.provinces = [];
    this.prefectures = [];

    if (regionId) {
      this.regionService.getProvincesByRegion(regionId).subscribe(data => {
        this.provinces = data;
      });

      this.regionService.getPrefecturesByRegion(regionId).subscribe(data => {
        this.prefectures = data;
      });
    }

    this.applyFilters();
  }

  onProvinceChange(provinceId: number): void {
    this.selectedProvince = provinceId;
    this.selectedPrefecture = null;
    this.applyFilters();
  }

  onPrefectureChange(prefectureId: number): void {
    this.selectedPrefecture = prefectureId;
    this.selectedProvince = null;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.hopitaux];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(h =>
        h.nom.toLowerCase().includes(term) ||
        h.adresse.toLowerCase().includes(term)
      );
    }

    // Filtre par région
    if (this.selectedRegion) {
      const region = this.regions.find(r => r.idRegion === this.selectedRegion);
      if (region) {
        filtered = filtered.filter(h => h.region === region.nom);
      }
    }

    // Filtre par province
    if (this.selectedProvince) {
      const province = this.provinces.find(p => p.idProvince === this.selectedProvince);
      if (province) {
        filtered = filtered.filter(h => h.province === province.nom);
      }
    }

    // Filtre par préfecture
    if (this.selectedPrefecture) {
      const prefecture = this.prefectures.find(p => p.idPrefecture === this.selectedPrefecture);
      if (prefecture) {
        filtered = filtered.filter(h => h.prefecture === prefecture.nom);
      }
    }

    this.totalItems = filtered.length;
    this.filteredHopitaux = this.paginateArray(filtered);
  }

  paginateArray(array: Hopital[]): Hopital[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return array.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Retour à la première page
    this.applyFilters();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onEdit(id: number): void {
    this.router.navigate([`/hopitaux/ajouter/${id}`]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet hôpital ?')) {
      this.hopitalService.deleteHopital(id).subscribe(() => {
        this.loadHopitaux();
      });
    }
  }

  navigateToServices(hopitalId: number): void {
    this.router.navigate(['/hopitaux/services', hopitalId]);
  }

  exportToExcel(): void {
    // Préparer les données pour l'export
    const data = this.hopitaux.map(h => ({
      ID: h.idHopital,
      Nom: h.nom,
      Adresse: h.adresse,
      Région: h.region,
      'Province/Préfecture': h.province || h.prefecture || ''
    }));

    // Créer une feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hôpitaux');

    // Générer le fichier Excel
    XLSX.writeFile(workbook, 'liste_hopitaux.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();

    // Ajouter un titre
    doc.text('Liste des Hôpitaux', 14, 16);

    // Préparer les données pour le tableau
    const tableColumn = ['ID', 'Nom', 'Adresse', 'Région', 'Province/Préfecture'];
    const tableRows = this.hopitaux.map(h => [
      h.idHopital.toString(),
      h.nom,
      h.adresse,
      h.region,
      h.province || h.prefecture || ''
    ]);

    // Utiliser autoTable avec la bonne syntaxe
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    // Enregistrer le PDF
    doc.save('liste_hopitaux.pdf');
  }
}
