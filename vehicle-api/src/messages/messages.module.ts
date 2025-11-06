import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  imports: [HttpModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

