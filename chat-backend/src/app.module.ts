import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
  imports: [MessagesModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
