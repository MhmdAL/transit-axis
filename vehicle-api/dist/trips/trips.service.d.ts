import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class TripsService {
    private readonly httpService;
    private readonly configService;
    private moveoCore;
    constructor(httpService: HttpService, configService: ConfigService);
    startTrip(tripData: any, authToken: string): Promise<any>;
    endTrip(tripId: string, authToken: string): Promise<any>;
}
