import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region } from '../models/region.model';
import { Province } from '../models/province.model';
import { Prefecture } from '../models/prefecture.model';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = 'http://localhost:8085';

  constructor(private http: HttpClient) {}

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/regions`);
  }

  getProvincesByRegion(regionId: number): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.apiUrl}/provinces/region/${regionId}`);
  }

  getPrefecturesByRegion(regionId: number): Observable<Prefecture[]> {
    return this.http.get<Prefecture[]>(`${this.apiUrl}/prefectures/region/${regionId}`);
  }
}
