import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Buttons'
    },
    children: [
      {
        path: '',
        redirectTo: 'buttons',
        pathMatch: 'full'
      },
      {
        path: 'buttons',
        loadComponent: () => import('./buttons/buttons.component').then(m => m.ButtonsComponent),
        data: {
          title: 'Buttons'
        }
      },

    ]
  }
];

