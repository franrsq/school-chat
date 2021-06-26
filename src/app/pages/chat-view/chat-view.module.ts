import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';

import { IonicModule } from '@ionic/angular';

import { ChatViewPageRoutingModule } from './chat-view-routing.module';

import { ChatViewPage } from './chat-view.page';
import { TranslateModule } from '@ngx-translate/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatViewPageRoutingModule,
    TranslateModule,
    AutosizeModule,
    ClipboardModule
  ],
  declarations: [ChatViewPage],
  providers: [Clipboard]
})
export class ChatViewPageModule { }
