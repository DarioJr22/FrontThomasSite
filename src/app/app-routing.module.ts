import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';

const routes: Routes = [
{
  path:'',
  component:HomeComponent
},
{
  path:'sobrenos',
  loadChildren:()=> import('./modules/sobrenos/sobrenos.module').then(x => x.SobrenosModule)
}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
