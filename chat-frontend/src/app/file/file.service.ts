import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectMyId, selectSelectedContactId } from '../store/contact/contact.selector';
import { url } from 'src/config';
import { MyFile } from './file.model';
import { Socket } from 'ngx-socket-io';
import * as FileActions from '../store/file/file.actions';

@Injectable({
  providedIn: 'root'
})
export class FileService {

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
    this.socket.fromEvent(eventName).pipe().subscribe((file: any) => {
      const { receivedFile, id } = file;
      this.receiveFile(receivedFile, id);
    });
  }

  private receiveFile(file: MyFile, openClientId: number) {
    if (openClientId == this.selectedContactId) {
      file.fileName = file.fileName.substring(0, file.fileName.lastIndexOf('_'));
      this.store.dispatch(FileActions.setCurrentFile({ currentFile: file }));
    }
  }

  sendFile(clientSendId: number, clientReceiveId: number, file: MyFile) {
    return this.http.post(url + '/files' + '/' + clientSendId + '/' + clientReceiveId,
      { file },
      { observe: 'response' }
    )
  }

  saveDecryptedFile(userId: number, file: MyFile) {
    return this.http.post(url + '/files' + '/' + userId + '/save',
      { file },
      { observe: 'response' }
    )
  }
}
