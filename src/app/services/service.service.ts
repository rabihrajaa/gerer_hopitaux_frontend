import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service, SousService } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8085/services';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  getServicesByHopital(hopitalId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/hopital/${hopitalId}`);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  getSousServicesByService(serviceId: number): Observable<SousService[]> {
    return this.http.get<SousService[]>(`${this.apiUrl}/${serviceId}/sous-services`);
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  updateService(service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${service.idService}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}