import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    provideHttpClient(),
    importProvidersFrom(SidebarModule, DropdownModule, IconModule),
    {
      provide: IconSetService,
      useFactory: () => {
        const service = new IconSetService();
        service.icons = { ...iconSubset };
        return service;
      }
    },
    provideAnimationsAsync()
  ]
};
