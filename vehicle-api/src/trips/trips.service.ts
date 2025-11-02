import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TripsService {
  private moveoCore: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.moveoCore = this.configService.get<string>('moveoCore.apiUrl') || 'http://localhost:3000';
  }

  async startTrip(tripData: any, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.moveoCore}/api/trips`, tripData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to start trip in moveo-core',
      );
    }
  }

  async endTrip(tripId: string, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.moveoCore}/api/trips/${tripId}/end`,
          {},
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
        error.response?.data?.message || 'Failed to end trip in moveo-core',
      );
    }
  }
}
