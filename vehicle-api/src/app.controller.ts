import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'VehicleApi',
      timestamp: new Date().toISOString(),
    };
  }
}
