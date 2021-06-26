import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

  sendMessage(chatId: string, message: string, isTeacher,
    mediaURL: string = null, mediaType: string = null) {

    const functionName = isTeacher ? 'sendAdminMessage' : 'sendMessage';
    return this.functions.httpsCallable(functionName)({
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

  async observeTodoMessages(chatId: string) {
    const uid = (await this.authService.getCurrentUser()).uid;
    return this.firestore.collection('admin-message').doc(chatId)
      .collection('messages', ref => ref.orderBy('sentAt')).snapshotChanges()
      .pipe(
        switchMap((messages) => {
          return combineLatest(
            messages.map((data) => {
              const message = data.payload.doc.data();
              const id = data.payload.doc.id;
              return combineLatest([this.getUserName(message.sentBy), this.observeMessageMarked(uid, chatId, id)])
                .pipe(
                  map(([name, marked]) => {
                    return {
                      sentName: name,
                      messageId: id,
                      ...message,
                      marked: marked
                    }
                  })
                );
            })
          );
        })
      );
  }

  observeMessageMarked(userId, chatId, messageId) {
    return this.firestore.collection('to-do').doc(userId)
      .collection('groups').doc(chatId).collection('messages').doc(messageId).valueChanges()
      .pipe(
        map((data) => {
          if (!data) {
            return false;
          }
          return data.marked;
        })
      );
  }

  getUserName(uid) {
    return this.firestore.collection('users').doc(uid).get({ source: 'server' }).pipe(
      map((snap: any) => snap.data().name)
    );
  }

  markMessage(groupId: string, messageId: string) {
    return this.functions.httpsCallable('markMessage')({ groupId: groupId, messageId: messageId });
  }

  unmarkMessage(groupId: string, messageId: string) {
    return this.functions.httpsCallable('unmarkMessage')({ groupId: groupId, messageId: messageId });
  }

  observeWaitingUsers(groupId: string) {
    return this.firestore.collection('groups').doc(groupId).valueChanges().pipe(
      switchMap((groupData: any) => {
        if (groupData.waiting == null || groupData.waiting.length == 0) {
          return of([]);
        }
        const list: [] = groupData.waiting.map(uid => {
          return this.observeUserInfo(uid).pipe(
            map((userInfo: any) => {
              return { uid: uid, ...userInfo }
            })
          );
        })
        return combineLatest(list);
      })
    );
  }

  observeUserInfo(uid) {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }

  acceptUser(uid: string, groupId: string) {
    return this.functions.httpsCallable('acceptUser')({ uid: uid, groupId: groupId });
  }

  rejectUser(uid: string, groupId: string) {
    return this.functions.httpsCallable('rejectUser')({ uid: uid, groupId: groupId });
  }
}
