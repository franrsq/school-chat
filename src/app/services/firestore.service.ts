import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
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
      .valueChanges();
  }
}
