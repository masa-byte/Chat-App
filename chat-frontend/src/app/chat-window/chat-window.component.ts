import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Message } from '../message/message.model';
import { MessageService } from '../message/message.service';
import { selectMyId, selectSelectedContactId } from '../store/contact/contact.selector';
import { selectMessages } from '../store/message/message.selector';
import { FoursquareCipherService } from '../ciphers/foursquare-cipher.service';
import { LeaCipherService } from '../ciphers/lea-cipher.service';
import { FileService } from '../file/file.service';
import { MyFile } from '../file/file.model';
import { selectCurrentFile } from '../store/file/file.selector';
import { MatSnackBar } from '@angular/material/snack-bar';


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
  currentFile: MyFile | null = null;

  constructor(
    private messageService: MessageService,
    private fileService: FileService,
    private foursquareCipherService: FoursquareCipherService,
    private leaCipherService: LeaCipherService,
    private snackBar: MatSnackBar,
    private store: Store<{}>
  ) { }

  ngOnInit(): void {
    this.store.select(selectMyId).subscribe(myId => {
      if (myId != null)
        this.myId = myId;
    });

    this.store.select(selectSelectedContactId).subscribe(selectedContactId => {
      this.selectedContactId = selectedContactId;
    });

    this.store.select(selectCurrentFile).subscribe(async currentFile => {
      if (currentFile != null) {
        this.currentFile = currentFile;
        await this.decryptFile();
      }
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

  private async decryptFile() {
    let [nameLength, name] = this.currentFile!.fileName.split('_');
    name = await this.leaCipherService.decryptMessage(name);
    name = name.substring(0, +nameLength);
    const extension = this.currentFile!.fileExtension;
    let [contentLength, content] = (this.currentFile!.content as string).split('\n');
    content = await this.leaCipherService.decryptBinaryFile(content);

    let uint8Array = new Uint8Array(content.split(',').map(Number));
    uint8Array = uint8Array.slice(0, +contentLength);

    const decipheredFile: MyFile = {
      sentByUser: false,
      fileName: name,
      fileExtension: extension,
      content: uint8Array
    };
    this.fileService.saveDecryptedFile(this.myId, decipheredFile).subscribe();

    this.snackBar.open(`File ${name} received!`, 'Close',
      {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const fileContent = reader.result;

      const message = `File ${file.name} sent!`;
      console.log(`[Chat Window] Sending File: ${file.name}`);
      let cipheredMessageContent = 'l ' + message.length + '\n';
      cipheredMessageContent += await this.leaCipherService.encryptMessage(message);
      this.messageService.sendMessage(this.myId, this.selectedContactId!, cipheredMessageContent).subscribe();

      const uint8Array = new Uint8Array(fileContent as ArrayBuffer);
      const stringArray = uint8Array.toString();
      let cipheredFileContent = uint8Array.length + '\n';
      cipheredFileContent += await this.leaCipherService.encryptBinaryFile(stringArray);
      
      let cipheredFileName = file.name.length + '_';
      cipheredFileName += await this.leaCipherService.encryptMessage(file.name);

      const cipheredFile: MyFile = {
        sentByUser: true,
        fileName: cipheredFileName,
        fileExtension: file.type,
        content: cipheredFileContent
      };

      this.fileService.sendFile(this.myId, this.selectedContactId!, cipheredFile).subscribe();
    };
  }

  private isFileBinary(file: File) {
    return file.type === 'application/pdf' ||
      file.type === 'application/zip' ||
      file.type === 'application/x-rar-compressed' ||
      file.type === 'application/x-7z-compressed' ||
      file.type === 'application/x-tar' ||
      file.type === 'application/x-msdownload' ||
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/gif' ||
      file.type === 'image/bmp'
  }

  formatDate(date: string): Date {
    const validDate = date.substring(0, date.lastIndexOf('_'));
    const dateComponents = validDate.split('-').map(Number);
    const [year, month, day, hours, minutes, seconds] = dateComponents;
    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);
    return dateObject;
  }
}
