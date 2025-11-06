import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { DutiesModule } from './duties/duties.module';
import { MessagesModule } from './messages/messages.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule,
    AuthModule,
    TripsModule,
    TelemetryModule,
    DutiesModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
