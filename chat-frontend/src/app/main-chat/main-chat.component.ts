import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { clients, num_of_clients } from 'config';
import { Contact } from '../client/client.model';
import { Message } from '../message/message.model';
import * as ContactActions from '../store/contact/contact.actions';
import * as MessageActions from '../store/message/message.actions';

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})
export class MainChatComponent implements OnInit {
  myId: number | null = null;
  contacts: Contact[] = [];
  messages: Message[] = [];

  constructor(private store: Store<{}>) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  private loadContacts(): void {
    const portMatch = window.location.port.match(/\d+/);
    const portToExclude = portMatch ? +portMatch[0] : null;
    const filteredKeys = Object.keys(clients).filter(port => +port !== portToExclude);
    const contacts = filteredKeys.map(port => clients[+port]);
    for (let i = 0; i < num_of_clients - 1; i++) {
      let contact = {
        clientId: contacts[i].id,
        name: contacts[i].name,
        port: +filteredKeys[i],
      };
      this.contacts.push(contact);
    }

    this.store.dispatch(ContactActions.setMyId({ myId: clients[portToExclude as number].id }));
    this.myId = clients[portToExclude as number].id;
  }

  // this is only for loading messages when switching between contacts for current session
  displayContactMessages(contact: Contact): void {
    console.log(`[Main Chat] Displaying messages for ${contact.name}`);
    this.store.dispatch(MessageActions.clearMessages());
    this.store.dispatch(ContactActions.setSelectedContactId({ selectedContactId: contact.clientId }));
    this.store.dispatch(MessageActions.loadMessages({ clientSendId: this.myId as number, clientReceiveId: contact.clientId }));
  }
}
