import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

class SendMessageDto {
  vehicleId: string;
  sentByUserId: string;
  message: string;
  severity?: string;
  routeId?: string;
  tripId?: string;
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('vehicle/:vehicleId')
  async getVehicleMessages(
    @Param('vehicleId') vehicleId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.messagesService.getVehicleMessages(
        vehicleId,
        limit,
        offset,
        token,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch messages',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }

      if (!sendMessageDto.vehicleId || !sendMessageDto.sentByUserId || !sendMessageDto.message) {
        throw new HttpException(
          'vehicleId, sentByUserId, and message are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.messagesService.sendMessage(sendMessageDto, token);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('templates')
  async getTemplates(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.messagesService.getMessageTemplates(token);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch templates',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

