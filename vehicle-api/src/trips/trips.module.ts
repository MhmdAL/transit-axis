import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [HttpModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
