import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TripsService } from './trips.service';

class StartTripDto {
  routeId: string;
  vehicleId: string;
  driverId: string;
  timestamp: string;
}

class EndTripDto {
  timestamp: string;
}

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('start')
  async startTrip(
    @Body() startTripDto: StartTripDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }
      
      const token = authHeader.replace('Bearer ', '');
      const result = await this.tripsService.startTrip(startTripDto, token);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to start trip',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/end')
  async endTrip(
    @Param('id') tripId: string,
    @Body() endTripDto: EndTripDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }
      
      const token = authHeader.replace('Bearer ', '');
      const result = await this.tripsService.endTrip(tripId, endTripDto, token);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to end trip',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
