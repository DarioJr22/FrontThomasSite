import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostagemComponent } from "./postagem.component";


const routes:Routes =[
  {
    path:'',
    component:PostagemComponent
  }
]

@NgModule({
  imports:[RouterModule.forChild(routes)]
})

export class PostagemRoutingModule{}
