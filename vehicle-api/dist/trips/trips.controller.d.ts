import { TripsService } from './trips.service';
declare class StartTripDto {
    routeId: string;
    vehicleId: string;
    driverId: string;
    timestamp: string;
}
declare class EndTripDto {
    timestamp: string;
}
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    startTrip(startTripDto: StartTripDto, authHeader: string): Promise<any>;
    endTrip(tripId: string, endTripDto: EndTripDto, authHeader: string): Promise<any>;
}
export {};
