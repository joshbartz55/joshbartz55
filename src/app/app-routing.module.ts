import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { IgvComponent } from './components/igv/igv.component';
import { MapsComponent } from './components/maps/maps.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'igv', component: IgvComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }

export const routingComponents = [
  HomeComponent, 
  SearchComponent, 
  IgvComponent, 
  MapsComponent, 
  DocumentationComponent
];
