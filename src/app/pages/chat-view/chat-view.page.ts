import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.page.html',
  styleUrls: ['./chat-view.page.scss'],
})
export class ChatViewPage implements OnInit {

  image = 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg'
  nameGroup = "Nombre grupo";
  onlyRead = false;
  //items: Observable<any>[] = [];
  items = [{ user: "JulioProfe", message: "Traer cuadernos", image: 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg' },
  { user: "JulioProfe", message: "Firmar examen de mate ", image: 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg' }];
  messages = [
    {
      user: 'simon',
      createdtAt:1554090856000,
      msg:'Hey whats up mate?'
    },
    {
      user: 'max',
      createdtAt:1554090856000,
      msg:'Working on the Ionic mission, you?'
    },
    {
      user: 'simon',
      createdtAt:1554090856000,
      msg:'Doing some new tutorial stuff'
    }
  ]

  currentUser='simon'
  newMsg = ''
  @ViewChild(IonContent) content:IonContent

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  changePath(path){
    this.router.navigate([path]);
  }

  sendMessage(){
    this.messages.push({
      user:'simon',
      createdtAt:new Date().getTime(),
      msg:this.newMsg
    });

    this.newMsg='';
    setTimeout(()=>{
      this.content.scrollToBottom(200);
    });
    
  }
}
