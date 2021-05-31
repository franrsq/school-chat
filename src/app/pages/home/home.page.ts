import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProfilePage } from 'src/app/modals/profile/profile.page';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  items = [
    { image: 'http://placekitten.com/g/200/300', name: "8-4", description: "como estamos" },
    { image: 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg', name: "8-3", description: "como estamos" }
  ];

  constructor(private authService: AuthService, private modalController: ModalController) { }

  ngOnInit() {
    this.authService.getUserData().then(async (data) => {
      if (!data) {
        const modal = await this.modalController.create({
          component: ProfilePage
        });
        modal.present();
      }
    });
  }

  hola(nombre) {
    console.log(nombre)
  }
}
