import { Component, OnInit } from '@angular/core';
import { Message } from '../message/message.model';
import { MessageService } from '../message/message.service';
import { Store } from '@ngrx/store';
import { selectMyId, selectSelectedContactId } from '../store/contact/contact.selector';
import { selectMessages } from '../store/message/message.selector';
import { map } from 'rxjs';
import { MessageCipherService } from '../message/message-cipher.service';

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

  constructor(
    private messageService: MessageService,
    private store: Store<{}>,
    private messageCipherService: MessageCipherService
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
    this.messages = this.messages.map(message => {
      const length = message.content.substring(0, message.content.indexOf('\n'));
      const content = message.content.substring(message.content.indexOf('\n') + 1);
      const newContent = this.messageCipherService.decipherMessage(content);
      return {
        ...message,
        content: newContent.substring(0, +length)
      };
    });
  }

  sendMessage(): void {
    const message = this.newMessage.trim();
    console.log(`[Chat Window] Sending message: ${message}`);
    let cipheredMessageContent = '';
    if (this.selectedContactId != null && message.length > 0) {
      cipheredMessageContent = message.length + '\n';
      cipheredMessageContent += this.messageCipherService.cipherMessage(message);
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
