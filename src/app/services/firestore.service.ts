import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore, private functions: AngularFireFunctions,
    private authService: AuthService) { }

  createChat(name: string, imageURL: string) {
    return this.functions.httpsCallable('createChat')({ name: name, imageURL: imageURL });
  }

  joinChat(chatId) {
    return this.functions.httpsCallable('joinChat')({ chatId: chatId });
  }

  async observeUserGroups() {
    const uid = (await this.authService.getCurrentUser()).uid;
    return this.firestore.collection('groups', ref => ref.where('members', 'array-contains', uid))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  observeChatData(chatId: string) {
    return this.firestore.collection('groups').doc(chatId).valueChanges();
  }

  sendMessage(chatId: string, message: string, mediaURL: string = null, mediaType: string = null) {
    return this.functions.httpsCallable('sendMessage')({
      groupId: chatId,
      message: message,
      mediaURL: mediaURL,
      mediaType: mediaType
    });
  }

  observeChatMessages(chatId: string, isAdminChat: boolean) {
    const messagePath = isAdminChat ? 'admin-message' : 'user-message';
    return this.firestore.collection(messagePath).doc(chatId)
      .collection('messages', ref => ref.orderBy('sentAt')).valueChanges()
      .pipe(
        map((messages) => {
          return messages.map((message: any) => {
            return { sentNameObs: this.getUserName(message.sentBy), ...message }
          });
        })
      );
  }

  getUserName(uid) {
    return this.firestore.collection('users').doc(uid).get({ source: 'server' }).pipe(
      map((snap: any) => snap.data().name)
    );
  }
}
