import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class TelemetryService {
    private readonly httpService;
    private readonly configService;
    private telemetryServiceUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    createTelemetry(telemetryData: any): Promise<any>;
}
