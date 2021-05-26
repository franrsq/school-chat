import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  validationMessages = {
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ]
  }
  forgotPassForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private authService: AuthService, private toastController: ToastController,
    private translateService: TranslateService) { }

  ngOnInit() {
    this.forgotPassForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ]))
    });
  }

  resetPassword(data) {
    this.authService.forgotPassword(data.email)
      .then(async () => {
        const msg = await this.translateService.get('emailSentSuccess').toPromise();
        const toast = await this.toastController.create({
          message: msg,
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      })
      .catch(async (error) => {
        let errorMsg = await this.translateService.get(error.code).toPromise();
        if (errorMsg === error.code) {
          errorMsg = await this.translateService.get('emailSentError').toPromise();
        }
        const toast = await this.toastController.create({
          message: errorMsg,
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

}
