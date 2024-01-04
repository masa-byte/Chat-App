import { Injectable } from '@nestjs/common';
import { numOfClients } from 'config';
import * as fs from 'fs';
import { MyFile } from './file.model';

@Injectable()
export class FilesService {
    private clientsEncryptedDirectories: { [key: string]: string } = {};
    private clientsDecryptedDirectories: { [key: number]: string } = {};

    constructor() {
        const currentWorkingDirectory = process.cwd();
        const oneLevelAbove = currentWorkingDirectory.substring(0, currentWorkingDirectory.lastIndexOf('\\'));

        let key: string;
        for (let i = 0; i < numOfClients; i++) {
            this.clientsDecryptedDirectories[i] = oneLevelAbove + '\\files\\decrypted\\client_' + i;
            for (let j = i + 1; j < numOfClients; j++) {
                key = i + '_' + j;
                this.clientsEncryptedDirectories[key] = oneLevelAbove + '\\files\\encrypted\\clients_' + i + '_' + j;
            }
        }

        // file directories are emptied at the beginning of every session
        Object.values(this.clientsEncryptedDirectories).forEach((clients) => {
            this.createClientsDirectory(clients, true);
        });

        Object.values(this.clientsDecryptedDirectories).forEach((clients) => {
            this.createClientsDirectory(clients, true);
        });
    }

    private createClientsDirectory(path: string, overwrite: boolean = false) {
        if (!fs.existsSync(path)) {
            console.log('[File Service] Creating directory: ' + path);
            fs.mkdirSync(path, { recursive: true });
        }
        else {
            if (overwrite) {
                console.log('[File Service] Overwriting directory: ' + path);
                fs.rmdirSync(path, { recursive: true });
                fs.mkdirSync(path);
            }
        }
    }

    async createFile(clientSendId: number, clientReceiveId: number, file: MyFile): Promise<void> {
        let key = clientSendId + '_' + clientReceiveId;
        let path = this.clientsEncryptedDirectories[key];
        if (path === undefined)
            key = clientReceiveId + '_' + clientSendId;
        path = this.clientsEncryptedDirectories[key];

        let fileExtension = '';
        switch (file.fileExtension) {
            case 'image/png':
                fileExtension = 'png';
                break;
            case 'image/jpeg':
                fileExtension = 'jpg';
                break;
            case 'image/gif':
                fileExtension = 'gif';
                break;
            case 'application/pdf':
                fileExtension = 'pdf';
                break;
            case 'text/plain':
                fileExtension = 'txt';
                break;
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                fileExtension = 'docx';
                break;
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                fileExtension = 'xlsx';
                break;
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                fileExtension = 'pptx';
                break;
            default:
                fileExtension = 'bin';
                break;
        }
        const fileName = file.fileName + '_' + clientSendId + `.${fileExtension}`;
        const filePath = path + '\\' + fileName;
        console.log('[File Service] Creating file: ' + filePath);
        return fs.promises.writeFile(filePath, file.content);
    }

    async saveDecryptedFile(clientSendId: number, file: MyFile): Promise<void> {
        let path = this.clientsDecryptedDirectories[clientSendId];
        const fileName = file.fileName;
        const filePath = path + '\\' + fileName;
        console.log('[File Service] Saving decrypted file: ' + filePath);
        const buffer = Buffer.alloc(Object.values(file.content).length);
        let i = 0;
        Object.values(file.content).forEach((value) => {
            buffer.writeUInt8(value, i);
            i++;
        });
        return fs.promises.writeFile(filePath, buffer);
    }
}
