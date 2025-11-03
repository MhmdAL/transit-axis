import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DutiesService {
  private moveoCore: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.moveoCore = this.configService.get<string>('moveoCore.apiUrl') || 'http://localhost:3000';
  }

  async getDuties(driverId: string, vehicleId: string, dutyType?: string, date?: string, authToken?: string) {
    try {
      let url = `${this.moveoCore}/api/duties?driverId=${driverId}&vehicleId=${vehicleId}`;
      
      if (dutyType) {
        url += `&dutyType=${dutyType}`;
      }

      if (date) {
        url += `&date=${date}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch duties from moveo-core',
      );
    }
  }
}
