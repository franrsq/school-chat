import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { NewChatPage } from 'src/app/modals/new-chat/new-chat.page';
import { ProfilePage } from 'src/app/modals/profile/profile.page';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter, ViewWillLeave {

  items: Observable<any>;
  isTeacher;
  userSubscription;

  constructor(private authService: AuthService, private modalController: ModalController,
    private alertController: AlertController, private firestoreService: FirestoreService,
    private toastController: ToastController, private translateService: TranslateService,
    private router: Router) { }

  async ionViewWillEnter() {
    this.userSubscription = (await this.authService.observeUserData()).subscribe(async (data: any) => {
      if (!data) {
        const modal = await this.modalController.create({
          component: ProfilePage
        });
        modal.present();
      } else {
        if (data.groups) {
          this.items = (await this.firestoreService.observeUserGroups());
        } else {
          this.items = null;
        }
        this.isTeacher = data.role === 'teacher';
      }
    });
  }

  openChat(chatId) {
    this.router.navigate(['chat-view', chatId]);
  }

  async showCreateGroup() {
    const modal = await this.modalController.create({
      component: NewChatPage
    });
    modal.present();
  }

  async showJoinChat() {
    const header = await this.translateService.get('joinGroupHeader').toPromise();
    const msg = await this.translateService.get('writeChatId').toPromise();
    const placeHolder = await this.translateService.get('chatId').toPromise();
    const cancel = await this.translateService.get('cancelText').toPromise();
    const save = await this.translateService.get('save').toPromise();

    const alert = await this.alertController.create({
      header: header,
      message: msg,
      backdropDismiss: false,
      inputs: [
        {
          name: 'chatId',
          type: 'text',
          placeholder: placeHolder
        }
      ],
      buttons: [
        {
          text: cancel,
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: save,
          handler: (data) => {
            if (!data.chatId) {
              alert.message = msg;
              return false;
            }
            this.joinChat(data.chatId.trim());
          }
        }
      ]
    });

    await alert.present();
  }

  joinChat(chatId: string) {
    this.firestoreService.joinChat(chatId).subscribe(async () => {
      const toast = await this.toastController.create({
        message: await this.translateService.get('dataSaved').toPromise(),
        duration: 2000,
        color: "success"
      });
      toast.present();
    });
  }

  ionViewWillLeave() {
    this.userSubscription.unsubscribe();
    this.items = null;
  }
}
