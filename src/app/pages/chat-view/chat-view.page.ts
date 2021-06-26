import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonContent, ModalController, ToastController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { WaitingPage } from 'src/app/modals/waiting/waiting.page';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';
import { ClipboardService } from 'ngx-clipboard';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.page.html',
  styleUrls: ['./chat-view.page.scss'],
})
export class ChatViewPage implements ViewWillEnter, ViewWillLeave {

  chatData;
  onlyRead = false;
  messages = []
  messagesSubscription;
  isAdminView = false;

  currentUid = ''
  newMsg = ''
  isTeacher;
  @ViewChild(IonContent) content: IonContent

  chatId;

  percentageVal;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private storageService: StorageService,
    private modalController: ModalController,
    private clipboard: Clipboard,
    private clipboardService: ClipboardService,
    private toastController: ToastController
  ) { }

  async ionViewWillEnter() {
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.currentUid = (await this.authService.getCurrentUser()).uid;
    this.isTeacher = (await this.authService.getUserData()).role == 'teacher';
    this.firestoreService.observeChatData(this.chatId).subscribe((chatData) => {
      this.chatData = chatData;
      this.isTeacher = this.isTeacher && this.chatData.admins.includes(this.currentUid);
    });
    this.messagesSubscription = this.firestoreService.observeChatMessages(this.chatId, false)
      .subscribe(m => this.messages = m);
  }

  clickTodo() {
    if (this.isTeacher) {
      this.isAdminView = !this.isAdminView;
      this.messagesSubscription.unsubscribe();
      this.messagesSubscription = this.firestoreService.observeChatMessages(this.chatId, this.isAdminView)
        .subscribe(m => this.messages = m);
    } else {
      this.router.navigate(['to-do-list', this.chatId]);
    }
  }

  sendMessage() {
    let message = this.newMsg.trim();
    if (message.length > 0) {
      this.newMsg = '';
    }
    this.firestoreService.sendMessage(this.chatId, message, this.isAdminView).subscribe();
  }

  async onSendImage(event) {
    const imgFile = event.target.files[0];
    this.sendMediaMessage(imgFile, 'image');
  }

  async onSendVideo(event) {
    const videoFile = event.target.files[0];
    this.sendMediaMessage(videoFile, 'video');
  }

  sendMediaMessage(mediaFile, mediaType) {
    const path = mediaType == 'image' ? 'images/' : 'videos/';
    const filePath = this.storageService.generateFileName(path);
    const fileRef = this.storageService.getRef(filePath);
    const uploadTask = this.storageService.upload(filePath, mediaFile);
    this.percentageVal = uploadTask.percentageChanges();
    uploadTask.snapshotChanges().pipe(
      finalize(async () => {
        this.firestoreService.sendMessage(this.chatId, ' ', this.isAdminView,
          await fileRef.getDownloadURL().toPromise(), mediaType).subscribe();
        this.percentageVal = null;
      })
    ).subscribe();
  }

  async clickCopy() {
    if (Capacitor.isNative) {
      this.clipboard.copy(this.chatId);
    } else {
      this.clipboardService.copy(this.chatId);
    }
    const toast = await this.toastController.create({
      message: 'Código copiado',
      duration: 2000,
      color: "success"
    });
    toast.present();
  }

  async clickList() {
    const modal = await this.modalController.create({
      component: WaitingPage,
      componentProps: {
        'chatId': this.chatId
      }
    });
    modal.present();
  }

  ionViewWillLeave() {
    this.messages = null;
    this.currentUid = null;
    this.messagesSubscription.unsubscribe();
    this.messagesSubscription = null;
  }
}
