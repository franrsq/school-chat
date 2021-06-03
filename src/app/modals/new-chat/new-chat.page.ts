import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { FirestoreService } from 'src/app/services/firestore.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.page.html',
  styleUrls: ['./new-chat.page.scss'],
})
export class NewChatPage implements OnInit {
  validationMessages = {
    name: [{ type: "required", message: "nameRequired" }],
  }
  chatForm: FormGroup;
  image;
  imgFile;
  percentageVal;

  constructor(private formBuilder: FormBuilder, private storageService: StorageService,
    private firestoreService: FirestoreService, private toastController: ToastController,
    private translateService: TranslateService, private modalController: ModalController) { }

  ngOnInit() {
    this.chatForm = this.formBuilder.group({
      name: new FormControl('', Validators.compose([
        Validators.required
      ])),
    });
  }

  onSave(data) {
    if (this.imgFile) {
      const filePath = this.storageService.generateFileName('images/');
      const fileRef = this.storageService.getRef(filePath);
      const uploadTask = this.storageService.upload(filePath, this.imgFile);
      this.percentageVal = uploadTask.percentageChanges();
      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          this.createChat(data.name, await fileRef.getDownloadURL().toPromise());
        })
      ).subscribe()
    } else {
      this.createChat(data.name, null);
    }
  }

  createChat(name, imageURL) {
    this.firestoreService.createChat(name, imageURL).subscribe(async () => {
      const toast = await this.toastController.create({
        message: await this.translateService.get('dataSaved').toPromise(),
        duration: 2000,
        color: "success"
      });
      toast.present();
      this.modalController.dismiss();
    });
  }

  async fileSelected(event) {
    this.imgFile = event.target.files[0];
    this.image = await this.storageService.readURL(event.target.files[0]);
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
