import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { filter, map, take } from 'rxjs/operators';
import { FilterComponent } from 'src/app/modals/filter/filter.component';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.page.html',
  styleUrls: ['./to-do-list.page.scss'],
})
export class ToDoListPage implements ViewWillEnter, ViewWillLeave {

  nameGroup = "Nombre grupo";
  //items: Observable<any>[] = [];
  messages = [];
  chatId;
  chatData;
  currentUid;
  messagesSubscription;
  filterType = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private popoverController: PopoverController
  ) {
  }

  async ionViewWillEnter() {
    this.chatId = this.route.snapshot.paramMap.get('chatId');
    this.firestoreService.observeChatData(this.chatId).subscribe((chatData) => {
      this.chatData = chatData;
    });
    this.messagesSubscription = (await this.firestoreService.observeTodoMessages(this.chatId))
      .subscribe(data => this.messages = data);
  }

  changePath(path) {
    this.router.navigate([path, this.chatId]);
  }

  async messageClick(message) {
    if (message.marked) {
      this.firestoreService.unmarkMessage(this.chatId, message.messageId).subscribe();
    } else {
      this.firestoreService.markMessage(this.chatId, message.messageId).subscribe();
    }
  }

  async filterPopover() {
    const popover = await this.popoverController.create({
      component: FilterComponent,
      cssClass: 'popover_setting',
      translucent: true
    });

    popover.onDidDismiss().then(async (result) => {
      if (this.filterType == result.data) {
        return;
      }
      if (result.data == 0) {
        // Todos
        this.messagesSubscription.unsubscribe();
        this.messagesSubscription = (await this.firestoreService.observeTodoMessages(this.chatId))
          .subscribe(data => this.messages = data);
      } else if (result.data == 1) {
        // Pendiente
        this.messagesSubscription.unsubscribe();
        this.messagesSubscription = (await this.firestoreService.observeTodoMessages(this.chatId))
          .pipe(
            map(data => data.filter(message => !message.marked))
          )
          .subscribe(data => this.messages = data);
      } else if (result.data == 2) {
        // Completado
        this.messagesSubscription.unsubscribe();
        this.messagesSubscription = (await this.firestoreService.observeTodoMessages(this.chatId))
          .pipe(
            map(data => data.filter(message => message.marked))
          )
          .subscribe(data => this.messages = data);
      }
      this.filterType = result.data;
    });

    return await popover.present();
  }

  ionViewWillLeave() {
    this.chatData = null;
    this.messages = null;
    this.messagesSubscription.unsubscribe();
    this.messagesSubscription = null;
  }
}
