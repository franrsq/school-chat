import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: AngularFireStorage) { }

  generateFileName(basePath) {
    const randomId = Math.random()
      .toString(36)
      .substring(2, 8);
    return `${basePath}${new Date().getTime()}_${randomId}`;
  }

  getRef(path) {
    return this.storage.ref(path);
  }

  upload(filePath, file) {
    return this.storage.upload(filePath, file);
  }

  readURL(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.onerror = e => rej(e);
      reader.readAsDataURL(file);
    });
  }
}
