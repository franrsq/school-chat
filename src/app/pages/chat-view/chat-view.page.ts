import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.page.html',
  styleUrls: ['./chat-view.page.scss'],
})
export class ChatViewPage implements OnInit {

  imageGroup = 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg'
  nameGroup = "Nombre grupo";
  onlyRead = false;
  //items: Observable<any>[] = [];
  items = [{ user: "JulioProfe", message: "Traer cuadernos", image: 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg' },
  { user: "JulioProfe", message: "Firmar examen de mate ", image: 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg' }];
  private input: string = '';

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  changePath(path){
    this.router.navigate([path]);
  }

  doSend() {
    console.log("Mensaje "+this.input)
  }
}
