import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hopital } from '../models/hopital.model';

@Injectable({
  providedIn: 'root'
})
export class HopitalService {
  private apiUrl = 'http://localhost:8085/hopitaux'; // Adaptez à votre API

  constructor(private http: HttpClient) {}

  getHopitaux(): Observable<Hopital[]> {
    return this.http.get<Hopital[]>(this.apiUrl);
  }

  getHopital(id: number): Observable<Hopital> {
    return this.http.get<Hopital>(`${this.apiUrl}/${id}`);
  }

  createHopital(hopital: Hopital): Observable<Hopital> {
    return this.http.post<Hopital>(this.apiUrl, hopital);
  }

  updateHopital(hopital: Hopital): Observable<Hopital> {
    return this.http.put<Hopital>(`${this.apiUrl}/${hopital.idHopital}`, hopital);
  }

  deleteHopital(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
