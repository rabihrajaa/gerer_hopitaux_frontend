import { Routes } from '@angular/router';
import { HopitauxComponent } from './views/hopitaux/hopitaux.component';
import { AjouterHopitalComponent } from './views/hopitaux/ajouter/ajouter.component';
import { ServicesHopitalComponent } from './views/hopitaux/services/services-hopital.component';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'hopitaux',
        component: HopitauxComponent
      },
      {
        path: 'hopitaux/ajouter',
        component: AjouterHopitalComponent
      },
      {
        path: 'hopitaux/ajouter/:id',
        component: AjouterHopitalComponent
      },
      {
        path: 'hopitaux/services/:id',
        component: ServicesHopitalComponent
      },
      {
        path: '',
        redirectTo: 'hopitaux',
        pathMatch: 'full'
      }
    ]
  }
];
