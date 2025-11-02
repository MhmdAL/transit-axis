import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class DutiesService {
    private readonly httpService;
    private readonly configService;
    private moveoCore;
    constructor(httpService: HttpService, configService: ConfigService);
    getDuties(driverId: string, vehicleId: string, dutyType?: string, authToken?: string): Promise<any>;
}
