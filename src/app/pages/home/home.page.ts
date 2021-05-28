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

}
