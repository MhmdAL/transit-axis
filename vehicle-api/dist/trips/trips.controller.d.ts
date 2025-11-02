import { TripsService } from './trips.service';
declare class StartTripDto {
    routeId: string;
    vehicleId: string;
    driverId: string;
    scheduledDepartureTime: string;
}
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    startTrip(startTripDto: StartTripDto, authHeader: string): Promise<any>;
    endTrip(tripId: string, authHeader: string): Promise<any>;
}
export {};
