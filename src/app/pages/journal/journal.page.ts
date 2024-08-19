import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Journal, JournalServiceService } from 'src/app/services/journal-service.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
})
export class JournalPage implements OnInit {
  @Input() id: string;
  journal: Journal;
  latitude: number;  // Añadir esta propiedad
  longitude: number; // Añadir esta propiedad

  constructor(
    private journalService: JournalServiceService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit() {
    console.log(this.id);

    this.journalService.getJournalById(this.id).subscribe(res => {
      this.journal = res;
      if (this.journal.location) {
        this.latitude = this.journal.location.latitude;
        this.longitude = this.journal.location.longitude;
        this.loadMap(); // Cargar el mapa después de obtener las coordenadas
      } else {
        console.error('Ubicación no encontrada en el journal');
      }
    });
  }

  loadMap(): void {
    const map = L.map('map').setView([this.latitude, this.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([this.latitude, this.longitude]).addTo(map)
      .bindPopup('Ubicación guardada')
      .openPopup();
  }

  async updateJournal() {
    await this.journalService.updateJournal(this.journal);
    const toast = await this.toastCtrl.create({
      message: "Receta actualizada",
      duration: 2000
    });
    toast.present();
    this.modalCtrl.dismiss();
  }

  async deleteJournal() { // Nota: Corregí el nombre del método a `deleteJournal`
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas eliminar esta receta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.journalService.removeJournal(this.id);
            const toast = await this.toastCtrl.create({
              message: 'Receta Eliminada exitosamente',
              duration: 2000,
              color: 'danger', // Opcional, agrega color al toast
            });
            toast.present();
            this.modalCtrl.dismiss(); // Opcional: cerrar el modal después de eliminar
          },
        },
      ],
    });

    await alert.present();
  }
}

