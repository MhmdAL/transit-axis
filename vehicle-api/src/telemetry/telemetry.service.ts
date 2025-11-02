import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelemetryService {
  private telemetryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.telemetryServiceUrl = this.configService.get<string>('telemetryService.apiUrl') || 'http://localhost:3003';
  }

  async createTelemetry(telemetryData: any) {
    try {
      console.log("telemetryServiceUrl", telemetryData);
      const response = await firstValueFrom(
        this.httpService.post(`${this.telemetryServiceUrl}/api/telemetry`, telemetryData),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to send telemetry to telemetry-service',
      );
    }
  }
}

