import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { NotfoundComponent } from './modules/notfound/notfound.component';

const routes: Routes = [
{
  path:'login',
  component:LoginComponent
},
{
  path:'',
  loadChildren:()=> import('./modules/home/home.module').then(x => x.HomeModule)
},
{
  path:'sobrenos',
  loadChildren:()=> import('./modules/sobrenos/sobrenos.module').then(x => x.SobreNosModule)
},
{
  path:'emhonra',
  loadChildren:()=> import('./modules/em-honra/em-honra.module').then(x => x.EmHonraModule)
},
 {
  path:'artigos',
  loadChildren:()=> import('./modules/postagem/postagem.module').then(x => x.PostagemModule)
},
{
  path:'faleconosco',
  loadChildren:()=> import('./modules/faleconosco/faleconosco.module').then(x => x.FaleconoscoModule)
},
{
  path: '**', pathMatch: 'full',
  component:NotfoundComponent
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
