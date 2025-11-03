import {
  Controller,
  Get,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DutiesService } from './duties.service';

@Controller('duties')
export class DutiesController {
  constructor(private readonly dutiesService: DutiesService) {}

  @Get()
  async getDuties(
    @Query('driverId') driverId: string,
    @Query('vehicleId') vehicleId: string,
    @Query('dutyType') dutyType?: string,
    @Query('date') date?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    try {
      if (!authHeader) {
        throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
      }

      if (!driverId || !vehicleId) {
        throw new HttpException('driverId and vehicleId are required', HttpStatus.BAD_REQUEST);
      }

      const token = authHeader.replace('Bearer ', '');
      const result = await this.dutiesService.getDuties(driverId, vehicleId, dutyType, date, token);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch duties',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
