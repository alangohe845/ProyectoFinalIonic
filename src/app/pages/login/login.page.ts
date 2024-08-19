import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/auth-service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  ionicForm: FormGroup;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthServiceService,
    private router: Router,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.ionicForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
        ],
      ],
    });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.ionicForm.valid) {
      try {
        const user = await this.authService.loginUser(this.ionicForm.value.email, this.ionicForm.value.password);
        await loading.dismiss();

        if (user) {
          this.presentAlert('Inicio de sesión exitoso', '¡Bienvenido!');
          this.router.navigate(['/journals']);
        } else {
          this.presentToast('Usuario no encontrado, verifique sus credenciales');
        }
      } catch (err) {
        await loading.dismiss();
        this.presentToast('Usuario no encontrado, verifique sus credenciales');
        console.log(err);
      }
    } else {
      await loading.dismiss();
      this.presentToast('Favor de rellenar todos los campos correctamente.');
    }
  }

  get errorControl() {
    return this.ionicForm.controls;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
