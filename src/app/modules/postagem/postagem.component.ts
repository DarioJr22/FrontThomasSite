import { Component, OnInit, TemplateRef } from '@angular/core';
import { PostService } from './postagem.service';
import { NotificationService } from 'src/app/shared/notification/notification.service';
import { NotificationType } from 'src/app/models/notification';
import { Operation } from 'src/app/models/Operation';
import { Post, TagHandler } from 'src/app/models/Post'
import { EditorInstance, EditorOption } from 'angular-markdown-editor';
import { MarkdownService } from 'ngx-markdown';
import '@github/markdown-toolbar-element'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../login/login.component';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'tcv-postagem',
  templateUrl: './postagem.component.html',
  styleUrls: ['./postagem.component.scss']
})
export class PostagemComponent implements OnInit {
  bsEditorInstance!: EditorInstance;
  operation:string = Operation.LIST

  editTempTag = ''
  conteudoDefault = ''

  Post:Post[] = []
  FiteredPosts:Post[] = [];
  searchFilter:any = {
    title:'',
    tag:''
  }
  tags:string[]=[]
  tagHandler:any[] = []
  editorOptions!: EditorOption
  markdownText!: string
  PostReading:Post = {
    postDTO:{
      id:'',
      title:'',
      subtitle:'',
      content:'',
      tags:[],
      date:'',
      user:null
    }
  }
  user:User = {
    login:'',
    password:'',
    repeatPassword:'',
    role:'USER',
    email:'',
    articleWriter:false
  }

  userTest = {
    login:'teste',
    password:'123',
    role:'USER',
    email:'teste@teste.com',
    id:'24'
  }


  constructor(
    private auth:AngularFireAuth,
    private postService:PostService,
    private notify:NotificationService,
    private markdownService: MarkdownService,
    private modalService:NgbModal,
    private userService:UsuarioService,
    private cookie:CookieService){}

  ngOnInit(): void {
    this.getPost()
    this.getTags()
    this.editorOptions = {
      autofocus: false,
      iconlibrary: 'fa',
      savable: false,
      onShow: (e) => this.bsEditorInstance = e,
      parser: (val) => this.parse(val)

    };
    this.markdownText = this.conteudoDefault
  }

  //Task - Validar o usuário antes de fazer o post
  validateUser(post:Post,modalContent:any){
    //Verifica se o usuário já logou


    let logged = false
    this.user.email = this.cookie.get('email')
    this.user.password = this.cookie.get('senha')
    console.log(this.user);

      this.auth
      .signInWithEmailAndPassword(this.user.email, this.user.password)
      .then(()=>{
        //Caso esteja, então segue pra criar o post
        this.changeOp('CREATE',post)
      })
      .catch((error) => {
        //se o bonito não tiver logado, então ele abre o modal
        this.openModal(post,modalContent)
      })
    return logged
    //Abre o modal para fazer o login do usuário

  }

  //Modal service
  openModal(post:any,content:any){
    this.modalService
   .open(content,{  modalDialogClass: 'custom-class',scrollable:true })
   .result
   .then((result) => {
   //Caso o cara tenha clicado para logar ele tenta fazer o login
       if (result){
           this.auth.signInWithEmailAndPassword(this.user.email, this.user.password)
           .then(()=>{
             this.userService.setCurrentUser(this.user)
             this.cookie.set('email',this.user.email)
             this.cookie.set('senha',this.user.password)
             this.changeOp('CREATE',post)
           })
           .catch((error) => {
             this.notify.notify({
               message: `Erro ao fazer o login :${error.message}`,
               type: NotificationType.ERROR
             })
           })
          }
        }
      )

  }


  //Task - Filtrar o post pelo titulo
  aplicarFiltro(){
    console.log(this.searchFilter);

    this.FiteredPosts = this.Post.filter((x)=>
    x.postDTO.title.toLowerCase().includes(this.searchFilter.title.toLowerCase())
    )
  }

  loginByCookie(){

  }
  parse(inputValue: string) {
    const markedOutput = this.markdownService.parse(inputValue.trim());
    this.highlight();

    return markedOutput;
  }

  highlight() {
    setTimeout(() => {
      this.markdownService.highlight();
    });
  }

  getPost(){
    this.postService.getArticle().subscribe({
        next:(data)=>{
            let dados:any
            dados = data
            dados.forEach((i:any) => {this.Post.push(i)});
            this.FiteredPosts = this.Post
        },
        error:(error)=>{
          this.notify.notify({
            message: 'Erro ao buscar artigos no firebase!',
            type: NotificationType.ERROR
          })
        }
    })
  }

  getTags(){
    this.postService.getTags().subscribe({
      next:(tags)=>{
        this.tags = []
        let tagsTemp:any
        tagsTemp = tags
        tagsTemp.forEach((i:any)=> this.tags.push(i))
      },
      error:(error)=>{
        this.notify.notify({
          message: `Erro:${error.message}`,
          type: NotificationType.ERROR
        })
      }
    })
  }

  buildForm(){
    this.PostReading ={
      postDTO:{
        id:'',
        title:'',
        subtitle:'',
        content:'',
        tags:[],
        date:'',
        user:null
      }
    }
  }

  changeOp(op:string, post:any){
    this.operation = op
    if(op == 'CREATE'){
      this.buildForm();
    } else if(op == 'UPDATE' || op == 'READ'){
      this.PostReading = post
    } else if(op == 'LIST'){
      this.PostReading = {
        postDTO:{
          id:'',
          title:'',
          subtitle:'',
          content:'',
          tags:[],
          date:'',
          user:null
        }
      }
    }
  }

  share(){
   navigator.share({
    title: this.PostReading.postDTO.title,
    text: 'Confira o artigo pesquisando pelo titulo na página da url.' ,
    url: window.location.href,

   })
   .then(() => console.log('Conteúdo compartilhado com sucesso.'))
   .catch((error) => console.error('Erro ao compartilhar:', error));
  }

  addtag(tag:string){
  this.PostReading.postDTO.tags.includes(tag) ? '' : this.PostReading.postDTO.tags.push(tag)
  }

  removeTag(tag:string){
    this.PostReading.postDTO.tags.splice(this.PostReading.postDTO.tags.indexOf(tag), 1);
  }

  tagHandlerUpdate(){
    this.tags.map( i =>
      this.tagHandler.push({
            tag:i,
            operation:Operation.LIST
          }
        )
      )
  }
  modalTagsManager(templateRef:any){
    this.tagHandlerUpdate()
    this.modalService.open(templateRef,{ windowClass: 'dark-modal',scrollable:true })
  }

  editToggle(tag:TagHandler){
    if(tag.operation == Operation.UPDATE || tag.operation == Operation.CREATE){
      tag.operation = Operation.LIST
    }else{
      tag.operation = Operation.UPDATE
      this.editTempTag = tag.tag
    }
  }

  save(data:TagHandler){
    if(data.operation == Operation.UPDATE && data.tag != ''){
    /* Requisição de edição da tag */
    this.postService.putTags(data.tag,this.editTempTag).subscribe({
      next:()=>{
        this.notify.notify({
          message: `Tag ${data.tag} criada com sucesso`,
          type: NotificationType.SUCSESS
        })
      },complete:()=>{
        this.getTags()
        data.operation = Operation.LIST
      }})

    } else if(data.operation == Operation.CREATE && data.tag != ''){
    /* Requisição de criação da tag */
    this.postService.postTags(data.tag).subscribe({
      next:()=>{
        this.notify.notify({
          message: `Tag ${data.tag} criada com sucesso`,
          type: NotificationType.SUCSESS
        })
      },complete:()=>{
        this.getTags()
        data.operation = Operation.LIST
      }
    })
    }else{
      this.tagHandler.pop()
    }
  }

  deleteTag(tag:string){
    /* Requsição de deleção da tag */
    this.postService.deleteTags(tag).subscribe({
      next:()=>{
        this.notify.notify({
          message: `Tag ${tag} deletada com sucesso`,
          type: NotificationType.SUCSESS
        })
      },complete:()=>{
        this.getTags()
        this.tagHandler.splice( this.tagHandler.indexOf(this.tagHandler.find((i)=>i.tag == tag)), 1);
      }
    })
  }

  create(){
    let newTag:TagHandler = {
      tag:'',
      operation:Operation.CREATE
    }
    this.tagHandler.push(newTag)
  }

  createPost(){

    this.PostReading.postDTO.content = this.markdownText
    this.PostReading.postDTO.user = this.userTest

    if(
    this.PostReading.postDTO.content != '' ||
    this.PostReading.postDTO.title != '' ||
    this.PostReading.postDTO.subtitle != '' ){
      this.postService.postArticle(this.PostReading.postDTO).subscribe({
        next:()=>{
          this.notify.notify({
            message: `Artigo criado com sucesso`,
            type: NotificationType.SUCSESS
          })
          this.PostReading.postDTO.content = ''
          this.PostReading.postDTO.tags = []
          this.PostReading.postDTO.date = ''
          this.PostReading.postDTO.title = ''
          this.PostReading.postDTO.subtitle = ''
          this.markdownText = this.conteudoDefault
        },
        error:(error)=>{
          this.notify.notify({
            message: `Erro:${error.message}`,
            type: NotificationType.ERROR
          })
        }
        ,complete:()=>{
          this.getPost()
          this.changeOp('LIST',this.PostReading)
        }
      })
    }else{
      this.notify.notify({
        message: `Campos: Titulo, Subtitulo e o conteúdo do post são obrigatórios.`,
        type: NotificationType.ERROR
      })
    }

  }


}
