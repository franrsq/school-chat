import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ViewDidEnter, ViewWillEnter, ViewWillLeave, IonList, IonGrid } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.page.html',
  styleUrls: ['./chat-view.page.scss'],
})
export class ChatViewPage implements ViewWillEnter, ViewWillLeave {

  image = 'https://sevilla.abc.es/gurme/wp-content/uploads/sites/24/2012/01/comida-rapida-casera.jpg'
  chatData;
  onlyRead = false;
  messages = []

  currentUid = 'simon'
  newMsg = ''
  @ViewChild(IonContent) content: IonContent

  chatId;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) { }

  async ionViewWillEnter() {
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.currentUid = (await this.authService.getCurrentUser()).uid;
    this.firestoreService.observeChatData(this.chatId).subscribe((chatData) => {
      this.chatData = chatData;
    });
    this.firestoreService.observeChatMessages(this.chatId, false).subscribe(m => this.messages = m);
  }

  changePath(path) {
    this.router.navigate([path]);
  }

  sendMessage() {
    let message = this.newMsg.trim();
    if (message.length > 0) {
      this.newMsg = '';
    }
    // TODO: ver admin
    this.firestoreService.sendMessage(this.chatId, message).subscribe();
  }

  ionViewWillLeave() {
    this.messages = null;
    this.currentUid = null;
  }
}
