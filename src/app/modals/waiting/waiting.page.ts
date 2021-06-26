import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.page.html',
  styleUrls: ['./waiting.page.scss'],
})
export class WaitingPage implements ViewWillEnter, ViewWillLeave {

  @Input() chatId: string;

  users = null;
  usersSubscription;

  constructor(private modalController: ModalController, private firestoreService: FirestoreService) { }

  ionViewWillEnter() {
    this.usersSubscription = this.firestoreService.observeWaitingUsers(this.chatId)
      .subscribe(u => this.users = u);
  }

  clickAccept(uid) {
    this.firestoreService.acceptUser(uid, this.chatId).subscribe();
  }

  clickReject(uid) {
    this.firestoreService.rejectUser(uid, this.chatId).subscribe();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  ionViewWillLeave() {
    this.usersSubscription.unsubscribe();
    this.users = null;
  }

}
