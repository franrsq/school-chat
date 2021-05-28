import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  validationMessages = {
    name: [{ type: "required", message: "nameRequired" }],
    email: [
      { type: "required", message: "emailRequired" },
      { type: "pattern", message: "invalidEmail" }
    ],
    password: [
      { type: "required", message: "passwordRequired" },
      { type: "minlength", message: "passwordMinLength" }
    ]
  }
  signUpForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private toastController: ToastController, private router: Router,
    private translateService: TranslateService) { }

  ngOnInit() {
    this.signUpForm = this.formBuilder.group({
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

  registerUser(data) {
    this.authService.signUp(data.email, data.password)
      .then(async () => {
        const toast = await this.toastController.create({
          message: 'Registro realizado exitosamente',
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
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
    // TODO: check native google login error messages
    this.authService.googleAuth()
      .then(async () => {
        const toast = await this.toastController.create({
          message: 'Inicio de sesión exitoso',
          duration: 2000,
          color: "success"
        });
        toast.present();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      })
      .catch(async (error) => {
        const toast = await this.toastController.create({
          message: 'Hubo un error al iniciar sesión',
          duration: 2000,
          color: "danger"
        });
        toast.present();
      });
  }

}
