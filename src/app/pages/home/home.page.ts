import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items = [{image : 'http://placekitten.com/g/200/300', name: "8-4", description: "como estamos"},
  {image : 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg', name: "8-3", description: "como estamos"}];
  constructor(private authService: AuthService) {}

  hola(nombre){
    console.log(nombre)
  }
}
