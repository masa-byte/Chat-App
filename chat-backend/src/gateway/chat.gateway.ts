import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as chokidar from 'chokidar';
import { numOfClients } from 'config';
import { Message } from 'src/messages/message.model';
import * as fsPromises from 'fs/promises';
import { MyFile } from 'src/files/file.model';

@WebSocketGateway({ cors: true })
export class ChatGateway {
    private clientsMessageDirectories: { [key: string]: string } = {};
    private clientsEncryptedFileDirectories: { [key: string]: string } = {};
    private watchers: { [key: string]: chokidar.FSWatcher } = {};

    @WebSocketServer()
    server;

    constructor() {
        const currentWorkingDirectory = process.cwd();
        const oneLevelAbove = currentWorkingDirectory.substring(0, currentWorkingDirectory.lastIndexOf('\\'));

        let key: string;
        for (let i = 0; i < numOfClients; i++) {
            for (let j = i + 1; j < numOfClients; j++) {
                key = i + '_' + j;
                this.clientsMessageDirectories[key] = oneLevelAbove + '\\messages\\clients_' + i + '_' + j;
                this.clientsEncryptedFileDirectories[key] = oneLevelAbove + '\\files\\encrypted\\clients_' + i + '_' + j;
            }
        }

        // creating watchers for each client pair
        this.createMessageWatchers();
        this.createFileWatchers();
    }

    private createFileWatchers() {
        Object.keys(this.clientsEncryptedFileDirectories).forEach((key) => {
            const path = this.clientsEncryptedFileDirectories[key];
            console.log('[Chat Gateway] Creating watcher for: ' + path);
            this.watchers[key] = chokidar.watch(path, {
                ignored: /(^|[/\\])\../,
                persistent: true,
            });

            const clientId1 = parseInt(key.split('_')[0]);
            const clientId2 = parseInt(key.split('_')[1]);

            this.watchers[key].on('add', async (path) => {
                console.log('[File System Watcher] File ' + path + ' has been added');
                const senderId = parseInt(path.substring(path.lastIndexOf('_') + 1, path.lastIndexOf('.')));

                const clientReceiveId = senderId === clientId1 ? clientId2 : clientId1;

                const receiverEventName = 'newFile_' + clientReceiveId;
                
                let receivedFile = await this.createFile(path, clientReceiveId, senderId);
                let id = senderId;
                this.server.emit(receiverEventName, { receivedFile, id });
            });
        });
    }

    private createMessageWatchers() {
        Object.keys(this.clientsMessageDirectories).forEach((key) => {
            const path = this.clientsMessageDirectories[key];
            console.log('[Chat Gateway] Creating watcher for: ' + path);
            this.watchers[key] = chokidar.watch(path, {
                ignored: /(^|[/\\])\../,
                persistent: true,
            });

            const clientSendId = parseInt(key.split('_')[0]);
            const clientReceiveId = parseInt(key.split('_')[1]);

            this.watchers[key].on('add', async (path) => {
                console.log('[File System Watcher] Message ' + path + ' has been added');
                const senderId = parseInt(path.substring(path.lastIndexOf('_') + 1, path.lastIndexOf('.')));

                const senderEventName = 'newMessage_' + clientSendId;
                const receiverEventName = 'newMessage_' + clientReceiveId;

                let receivedMessage = await this.createMessage(path, clientSendId, senderId);
                let id = clientReceiveId;
                this.server.emit(senderEventName, { receivedMessage, id });
                
                receivedMessage = await this.createMessage(path, clientReceiveId, senderId);
                id = clientSendId;
                this.server.emit(receiverEventName, { receivedMessage, id });
            });
        });
    }

    private async createMessage(path: string, clientId: number, senderId: number): Promise<Message> {
        const content = await fsPromises.readFile(path, 'utf8');
        const fileName = path.substring(path.lastIndexOf('\\') + 1);

        const message: Message = {
            sentByUser: senderId === clientId,
            fileName: fileName,
            content: content,
        };

        return message;
    }

    private async createFile(path: string, clientId: number, senderId: number): Promise<MyFile> {
        const content = await fsPromises.readFile(path, 'utf8');
        const fileName = path.substring(path.lastIndexOf('\\') + 1);

        const file: MyFile = {
            sentByUser: senderId === clientId,
            fileName: fileName,
            fileExtension: fileName.substring(fileName.lastIndexOf('.') + 1),
            content: content,
        };

        return file;
    }

}