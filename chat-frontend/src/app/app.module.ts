import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';
import { SocketIoModule } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { contactReducer } from './store/contact/contact.reducer';
import { messageReducer } from './store/message/message.reducer';
import { MessageEffects } from './store/message/message.effects';
import { socketConfig } from 'src/config';

@NgModule({
  declarations: [
    AppComponent,
    ContactListComponent,
    MainChatComponent,
    ChatWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    MatRadioModule,
    StoreModule.forRoot({
      contact: contactReducer,
      messages: messageReducer
    }, {}),
    EffectsModule.forRoot([MessageEffects, ]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
    SocketIoModule.forRoot(socketConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
