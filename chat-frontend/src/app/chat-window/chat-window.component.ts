import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, map } from 'rxjs';
import { Message } from '../message/message.model';
import { MessageService } from '../message/message.service';
import { selectMyId, selectSelectedContactId } from '../store/contact/contact.selector';
import { selectMessages } from '../store/message/message.selector';
import { FoursquareCipherService } from '../ciphers/foursquare-cipher.service';
import { LeaCipherService } from '../ciphers/lea-cipher.service';


@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {
  myId: number = 0;
  selectedContactId: number | null = 0;
  messages: Message[] = [];
  newMessage: string = '';
  selectedCryptoAlgorithm: string = 'foursquare';

  constructor(
    private messageService: MessageService,
    private store: Store<{}>,
    private foursquareCipherService: FoursquareCipherService,
    private leaCipherService: LeaCipherService
  ) { }

  ngOnInit(): void {
    this.store.select(selectMyId).subscribe(myId => {
      if (myId != null)
        this.myId = myId;
    });

    this.store.select(selectSelectedContactId).subscribe(selectedContactId => {
      this.selectedContactId = selectedContactId;
    });

    this.store.select(selectMessages).pipe(
      map(messages => Object.entries(messages))
    ).subscribe(async messages => {
      if (messages != undefined) {
        if (messages.length == 0)
          this.messages = [];
        else {
          let mess = (messages as [string, Message][]).map(message => message[1]);
          await this.decryptMessages(mess);
        }
      }
    });

  }

  async decryptMessages(messages: Message[]) {
    let i = 0;
    this.messages = await Promise.all(messages.map(async (message) => {
      console.log(message);
      const algorithm = message.content.substring(0, message.content.indexOf(' '));
      let length = '';
      let newContent = '';

      if (algorithm == 'f') {
        length = message.content.substring(message.content.indexOf(' '), message.content.indexOf('\n'));
        const content = message.content.substring(message.content.indexOf('\n') + 1);
        newContent = await this.foursquareCipherService.decryptMessage(content);
      }
      else if (algorithm == 'l') {
        length = message.content.substring(message.content.indexOf(' '), message.content.indexOf('\n'));
        const content = message.content.substring(message.content.indexOf('\n') + 1);
        newContent = await this.leaCipherService.decryptMessage(content);
      }

      return {
        ...message,
        content: newContent.substring(0, +length)
      };
    })
    );
  }

  async sendMessage(): Promise<void> {
    let message = this.newMessage.trim();
    console.log(`[Chat Window] Sending message: ${message}`);
    let cipheredMessageContent = '';

    if (this.selectedContactId != null && message.length > 0) {

      if (this.selectedCryptoAlgorithm == 'foursquare') {
        cipheredMessageContent = 'f ' + message.length + '\n';
        cipheredMessageContent += await this.foursquareCipherService.encryptMessage(message);
      }
      else if (this.selectedCryptoAlgorithm == 'lea') {
        cipheredMessageContent = 'l ' + message.length + '\n';
        cipheredMessageContent += await this.leaCipherService.encryptMessage(message);
      }
      this.messageService.sendMessage(this.myId, this.selectedContactId!, cipheredMessageContent).subscribe();
    }

    this.newMessage = '';
  }

  formatDate(date: string): Date {
    const validDate = date.substring(0, date.lastIndexOf('_'));
    const dateComponents = validDate.split('-').map(Number);
    const [year, month, day, hours, minutes, seconds] = dateComponents;
    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);
    return dateObject;
  }
}
