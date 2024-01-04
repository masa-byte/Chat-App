import { Body, Controller, Param, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { MyFile } from './file.model';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post(':clientSendId/save')
    async saveDecryptedFile(@Param('clientSendId') clientSendId: number, @Body() file: MyFile): Promise<void> {
        try {
            return await this.filesService.saveDecryptedFile(clientSendId, file['file']);
        }
        catch (error) {
            console.log('Error saving decrypted file: ' + error);
        }
    }

    @Post(':clientSendId/:clientReceiveId')
    async createFile(
        @Param('clientSendId') clientSendId: number,
        @Param('clientReceiveId') clientReceiveId: number,
        @Body() file: File): Promise<void> {
        try {
            const myFile: MyFile = {
                sentByUser: true,
                fileName: file['file'].fileName,
                fileExtension: file['file'].fileExtension,
                content: file['file'].content
            };
            return await this.filesService.createFile(clientSendId, clientReceiveId, myFile);
        }
        catch (error) {
            console.log('Error creating file: ' + error);
        }
    }
}
