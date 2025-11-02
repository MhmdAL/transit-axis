import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [HttpModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
})
export class TelemetryModule {}

