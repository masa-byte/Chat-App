import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Socket } from 'ngx-socket-io';
import { url } from 'config';
import { Observable } from 'rxjs';
import { Message } from './message.model';
import * as MessageActions from '../store/message/message.actions';
import { selectMyId, selectSelectedContactId } from '../store/contact/contact.selector';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  myId: number = 0;
  selectedContactId: number = 0;

  constructor(
    private http: HttpClient,
    private socket: Socket,
    private store: Store<{}>
  ) {
    this.store.select(selectMyId).subscribe(myId => {
      if (myId != null) {
        this.myId = myId;
        this.initializeSocket();
      }
    });

    this.store.select(selectSelectedContactId).subscribe(selectedContactId => {
      if (selectedContactId != null)
        this.selectedContactId = selectedContactId;
    });
  }

  private initializeSocket() {
    const eventName = 'newFile_' + this.myId;
    this.socket.fromEvent(eventName).pipe().subscribe((message: any) => {
      const { receivedMessage, id } = message;
      this.receiveMessage(receivedMessage, id);
    });
  }

  private receiveMessage(message: Message, openClientId: number) {
    if (openClientId == this.selectedContactId)
      this.store.dispatch(MessageActions.addMessage({ message }));
  }

  sendMessage(clientSendId: number, clientReceiveId: number, message: string): Observable<HttpResponse<any>> {
    return this.http.post(url + '/messages' + '/' + clientSendId + '/' + clientReceiveId,
      { message },
      { observe: 'response' }
    )
  }

  getMessages(clientSendId: number, clientReceiveId: number): Observable<HttpResponse<any>> {
    return this.http.get(url + '/messages' + '/' + clientSendId + '/' + clientReceiveId,
      { observe: 'response' }
    )
  }
}
