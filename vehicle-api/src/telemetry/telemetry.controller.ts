import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

class TelemetryDto {
  vehicleId: number;
  tripId?: number;
  routeId?: number;
  driverId?: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  timestamp?: string;
}

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  async createTelemetry(@Body() telemetryDto: TelemetryDto) {
    try {
      const result = await this.telemetryService.createTelemetry(telemetryDto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send telemetry',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

