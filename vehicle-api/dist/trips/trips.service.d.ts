import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
declare class EndTripDto {
    timestamp: string;
}
export declare class TripsService {
    private readonly httpService;
    private readonly configService;
    private moveoCore;
    constructor(httpService: HttpService, configService: ConfigService);
    startTrip(tripData: any, authToken: string): Promise<any>;
    endTrip(tripId: string, endTripDto: EndTripDto, authToken: string): Promise<any>;
}
export {};
