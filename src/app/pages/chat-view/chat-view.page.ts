import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ViewWillEnter, ViewWillLeave, IonList, IonGrid } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';

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
    private storageService: StorageService
  ) { }

  async ionViewWillEnter() {
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.currentUid = (await this.authService.getCurrentUser()).uid;
    this.isTeacher = (await this.authService.getUserData()).role == 'teacher';
    this.firestoreService.observeChatData(this.chatId).subscribe((chatData) => {
      this.chatData = chatData;
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
      // Navigate to todo view
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

  ionViewWillLeave() {
    this.messages = null;
    this.currentUid = null;
  }
}
