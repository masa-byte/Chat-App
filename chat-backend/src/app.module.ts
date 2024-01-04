import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { ChatGateway } from './gateway/chat.gateway';
import { FilesModule } from './files/files.module';

@Module({
  imports: [MessagesModule, FilesModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
