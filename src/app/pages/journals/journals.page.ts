import { Component, OnInit,ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonModal, LoadingController, MenuController, ModalController, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { AuthServiceService } from 'src/app/auth-service.service';
import { Journal, JournalServiceService } from 'src/app/services/journal-service.service';
import { JournalPage } from '../journal/journal.page';

@Component({
  selector: 'app-journals',
  templateUrl: './journals.page.html',
  styleUrls: ['./journals.page.scss'],
})
export class JournalsPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  title:string
  note:string
  userId:any
  location: { latitude: number; longitude: number };

  selectedJournal:Journal={
  userId: '',
  title: '',
  content: '',
  createdAt: undefined,
  location: { latitude: 0, longitude: 0 }
}
  journals:Journal[] = []
  constructor(private modalCtrl: ModalController,private toastCtrl: ToastController,private loadingController: LoadingController,private journalServive:JournalServiceService,private authService:AuthServiceService, private menu: MenuController) {
   }


   async getLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.location = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      };
      console.log('Location:', this.location);
    } catch (error) {
      console.error('Error getting location', error);
    }
  }
  async addJournal(){
    await this.getLocation(); // Obtain location before adding journal
      this.journalServive.addJournal(
        {userId:"", title:this.title,content:this.note,createdAt:new Date(), location: this.location }
      )?.then(async ()=>{
        this.title =''
        this.note = ''
        const toast = await this.toastCtrl.create({
          message: "Receta creada con exito",
          duration:2000
        })
        toast.present()
      }).catch(async (error)=>{
        const toast = await this.toastCtrl.create({
          message: error,
          duration:2000
        })
        toast.present()
        
      })
    
  }
  cardColor: string = '#F0F0F0'; 

  colors: string[] = ['#FFFFFF', '#F0F2F9', '#FFDDC1', '#D1E8E2', '#F0F0F0'];

  changeCardColor() {
    const currentIndex = this.colors.indexOf(this.cardColor);
    const nextIndex = (currentIndex + 1) % this.colors.length;
    this.cardColor = this.colors[nextIndex];
  }
 
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  
  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log(ev.detail.data);
    }
  }

  confirm() {
    this.modal.dismiss('confirm');
    this.addJournal()
  }

  ngOnInit() {
    this.authService.getProfile().then(user => {
      this.userId = user?.uid;
      console.log(user?.uid);
      this.journalServive.getJournals(this.userId).subscribe(res => {
        this.journals = res.map(journal => {
          // Convertir createdAt a Date si es necesario
          if (journal.createdAt) {
            const timestamp = journal.createdAt as any;
            journal.createdAt = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
          }
          return journal;
        });
        console.log(this.journals);
      });
    }).catch(error => {
      console.error('Error getting user profile:', error);
    });
  }
  

  async openJournal(journal:Journal){
    const modal = await this.modalCtrl.create({
      component:JournalPage,
      componentProps:{id:journal.id},
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.6
    })

    await modal.present()
  }
  ionViewWillEnter() {
    this.menu.enable(true, 'main-menu');
  }

  ionViewWillLeave() {
    this.menu.enable(false, 'main-menu');
  }

}
