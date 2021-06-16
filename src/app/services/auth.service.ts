import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public auth: AngularFireAuth, private router: Router,
    private ngZone: NgZone, private googlePlus: GooglePlus,
    private firestore: AngularFirestore
  ) {
    this.auth.onAuthStateChanged(async (user) => {
      // User sign out
      if (!user) {
        this.ngZone.run(() => {
          if (this.router.url == '/sign-up' || this.router.url == '/forgot-password') {
            return;
          }
          this.router.navigate(['/login']);
        });
        return;
      }
    });
  }

  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async signUp(email: string, password: string) {
    const result = await this.auth.createUserWithEmailAndPassword(email, password);
    this.sendVerificationEmail();
    return result;
  }

  async sendVerificationEmail() {
    return (await this.auth.currentUser).sendEmailVerification();
  }

  forgotPassword(passwordResetEmail: string) {
    return this.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  async googleAuth() {
    if (Capacitor.isNative) {
      if (Capacitor.platform == 'android') {
        let params = {
          webClientId: '327877834996-s0rhp8m496u5n56csdeeequvnb3f94rj.apps.googleusercontent.com',
          offline: true
        };

        const { idToken, accessToken } = await this.googlePlus.login(params);
        const credential = accessToken ? firebase.auth.GoogleAuthProvider.credential(idToken, accessToken) :
          firebase.auth.GoogleAuthProvider.credential(idToken);
        return this.auth.signInWithCredential(credential);
      }
    }
    return this.authLogin(new firebase.auth.GoogleAuthProvider());
  }

  private authLogin(provider) {
    return this.auth.signInWithPopup(provider);
  }

  logout() {
    return this.auth.signOut();
  }

  async getCurrentUser() {
    return await this.auth.currentUser;
  }

  async observeUserData() {
    return this.firestore.collection('users').doc((await this.getCurrentUser()).uid).valueChanges();
  }

  async getUserData(): Promise<any> {
    return this.firestore.collection('users').doc((await this.getCurrentUser()).uid)
      .get({ source: 'server' }).pipe(
        map(snap => snap.data())
      ).toPromise();
  }

  async saveUserData(photoURL: string, name: string, role: string) {
    let user = await this.getCurrentUser();
    return this.firestore.collection('users').doc(user.uid).set({
      name: name,
      photoURL: photoURL ? photoURL : user.photoURL,
      role: role
    });
  }
}
