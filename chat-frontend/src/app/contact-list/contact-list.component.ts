import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Contact } from '../client/client.model';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  @Input() contacts: Contact[] = [];
  @Output() selectContactEvent = new EventEmitter<Contact>();

  constructor() {}

  ngOnInit(): void {
    this.selectContact(this.contacts[0]);
  }

  selectContact(contact: Contact): void {
    this.selectContactEvent.emit(contact);
  }
}
