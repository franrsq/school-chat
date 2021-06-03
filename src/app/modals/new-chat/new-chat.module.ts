import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewChatPageRoutingModule } from './new-chat-routing.module';

import { NewChatPage } from './new-chat.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewChatPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [NewChatPage]
})
export class NewChatPageModule {}
