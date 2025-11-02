import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DutiesController } from './duties.controller';
import { DutiesService } from './duties.service';

@Module({
  imports: [HttpModule],
  controllers: [DutiesController],
  providers: [DutiesService],
})
export class DutiesModule {}
