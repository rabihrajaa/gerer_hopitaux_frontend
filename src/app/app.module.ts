import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IconModule, IconSetModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    IconModule,
    IconSetModule.forRoot(iconSubset)
  ],
  providers: [IconSetService],
  bootstrap: []
})
export class AppModule {
  constructor(private iconSetService: IconSetService) {
    // Assurez-vous que le service d'icônes est initialisé avec le sous-ensemble d'icônes
    this.iconSetService.icons = { ...iconSubset };
  }
}