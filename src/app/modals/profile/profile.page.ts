import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  validationMessages = {
    name: [{ type: "required", message: "nameRequired" }],
  }
  profileForm: FormGroup;
  image;
  imgFile;
  percentageVal;

  constructor(private formBuilder: FormBuilder, private modalController: ModalController,
    private authService: AuthService, private toastController: ToastController,
    private translateService: TranslateService, private storageService: StorageService) {
  }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      name: new FormControl('', Validators.compose([
        Validators.required
      ])),
      role: new FormControl('regular')
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
          this.saveUserData(await fileRef.getDownloadURL().toPromise(), data.name, data.role);
        })
      ).subscribe()
    } else {
      this.saveUserData(null, data.name, data.role);
    }
  }

  saveUserData(photoURL, name, role) {
    this.authService.saveUserData(photoURL, name, role).then(async () => {
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

}
