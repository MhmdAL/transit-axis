import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the vehicle emulator
  app.enableCors();
  
  // Get port from config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3002;
  
  await app.listen(port);
  console.log(`VehicleApi is running on: http://localhost:${port}`);
}
bootstrap();
