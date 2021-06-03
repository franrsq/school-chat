import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  validationUserMessage = {
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ],
    password: [
      { type: "required", message: "passwordRequired" },
      { type: "minlength", message: "passwordMinLength" }
    ]
  }
  formLogin: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private router: Router, private toastController: ToastController,
    private translateService: TranslateService, private zone: NgZone) { }

  ngOnInit() {
    this.formLogin = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ]))
    });
  }

  login(data) {
    this.authService.login(data.email, data.password)
      .then(async () => {
        const msg = await this.translateService.get('loginSuccess').toPromise();
        const toast = await this.toastController.create({
          message: msg,
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      })
      .catch(async (error) => {
        let errorMsg = await this.translateService.get(error.code).toPromise();
        if (errorMsg === error.code) {
          errorMsg = await this.translateService.get('loginError').toPromise();
        }
        const toast = await this.toastController.create({
          message: errorMsg,
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

  loginGoogle() {
    this.authService.googleAuth()
      .then(async () => {
        const msg = await this.translateService.get('loginSuccess').toPromise();
        const toast = await this.toastController.create({
          message: msg,
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.zone.run(() => this.router.navigateByUrl('/home'));
      })
      .catch(async (error) => {
        let errorMsg = await this.translateService.get(error.code).toPromise();
        if (errorMsg === error.code) {
          errorMsg = await this.translateService.get('loginError').toPromise();
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
