export interface Service {
  idService?: number;
  nom: string;
  description: string;
  hopital?: {
    idHopital: number;
  };
  sousServicesDTO?: SousService[];
}

export interface SousService {
  idSousService?: number;
  nom: string;
  description: string;
  service?: {
    idService: number;
  };
}