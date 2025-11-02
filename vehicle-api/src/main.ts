import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn', 'verbose'],
  });
  
  // Enable CORS for the vehicle emulator
  app.enableCors();
  
  // Get port from config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3002;
  
  const logger = new Logger('VehicleAPI');
  await app.listen(port);
  logger.debug(`VehicleAPI is running on: http://localhost:${port}`);
  logger.debug('Debug logging enabled');
}
bootstrap();
