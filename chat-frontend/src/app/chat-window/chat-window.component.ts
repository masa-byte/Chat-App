import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
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

    const bits1 = "11111111111111111111111111111000";
    const num1 = parseInt(bits1, 2);
    const num = 5;
    const rotatedBits = ((num1 << num) | (num1 >>> (32 - num))) & 0xffffffff;
    console.log(rotatedBits>>> 0);
    console.log((rotatedBits>>>0).toString(2));
    const rotatedBits2 = ((num1 >>> num) | (num1 << (32 - num))) & 0xffffffff;
    console.log(rotatedBits2>>> 0);
    console.log((rotatedBits2 >>> 0).toString(2).padStart(32, '0'));

    this.store.select(selectMyId).subscribe(myId => {
      if (myId != null)
        this.myId = myId;
    });

    this.store.select(selectSelectedContactId).subscribe(selectedContactId => {
      this.selectedContactId = selectedContactId;
    });

    this.store.select(selectMessages).pipe(
      map(messages => Object.entries(messages))
    ).subscribe(messages => {
      if (messages != undefined) {
        if (messages.length == 0)
          this.messages = [];
        else {
          this.messages = (messages as [string, Message][]).map(message => message[1]);
          this.decipherMessages();
        }
      }
    });

  }

  private decipherMessages() {
    let i = 0;
    this.messages = this.messages.map(message => {
      const algorithm = message.content.substring(0, message.content.indexOf(' '));
      let length = '';
      let newContent = '';

      if (algorithm == 'f') {
        length = message.content.substring(message.content.indexOf(' '), message.content.indexOf('\n'));
        const content = message.content.substring(message.content.indexOf('\n') + 1);
        newContent = this.foursquareCipherService.decipherMessage(content);
      }
      else if (algorithm == 'l') {
        length = message.content.substring(message.content.indexOf(' '), message.content.indexOf('\n'));
        const content = message.content.substring(message.content.indexOf('\n') + 1);
        newContent = this.leaCipherService.decipherMessage(content);
      }
      
      return {
        ...message,
        content: newContent.substring(0, +length)
      };
    });
  }

  sendMessage(): void {
    let message = this.newMessage.trim();
    console.log(`[Chat Window] Sending message: ${message}`);
    let cipheredMessageContent = '';

    if (this.selectedContactId != null && message.length > 0) {

      if (this.selectedCryptoAlgorithm == 'foursquare') {
        cipheredMessageContent = 'f ' + message.length + '\n';
        cipheredMessageContent += this.foursquareCipherService.cipherMessage(message);
      }
      else if (this.selectedCryptoAlgorithm == 'lea') {
        //message = "00010000000100010001001000010011000101000001010100010110000101110001100000011001000110100001101100011100000111010001111000011111";
        cipheredMessageContent = 'l ' + message.length + '\n';
        cipheredMessageContent += this.leaCipherService.cipherMessage(message);
      }

      this.messageService.sendMessage(this.myId, this.selectedContactId, cipheredMessageContent).subscribe();
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
