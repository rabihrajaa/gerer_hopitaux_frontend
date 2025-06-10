import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Hopitaux',
    url: '/hopitaux',
    iconComponent: { name: 'cil-cursor' },
    children: [
      {
        name: 'Liste des Hopitaux',
        url: '/hopitaux/hopitaux',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Ajouter Hopital',
        url: '/hopitaux/ajouter',
        icon: 'nav-icon-bullet'
      },
    ]
  }
];
