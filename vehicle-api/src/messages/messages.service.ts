import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessagesService {
  private moveoCore: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.moveoCore = this.configService.get<string>('moveoCore.apiUrl') || 'http://localhost:3000';
  }

  async getVehicleMessages(vehicleId: string, limit: number = 50, offset: number = 0, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.moveoCore}/api/vehicle-messages/vehicle/${vehicleId}`,
          {
            params: { limit, offset },
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch messages from moveo-core',
      );
    }
  }

  async sendMessage(messageData: any, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.moveoCore}/api/vehicle-messages`,
          messageData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to send message to moveo-core',
      );
    }
  }

  async getMessageTemplates(authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.moveoCore}/api/vehicle-messages/templates/all`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch templates from moveo-core',
      );
    }
  }
}

