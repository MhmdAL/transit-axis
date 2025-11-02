import { TelemetryService } from './telemetry.service';
declare class TelemetryDto {
    vehicleId: number;
    tripId?: number;
    routeId?: number;
    driverId?: number;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
    timestamp?: string;
}
export declare class TelemetryController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    createTelemetry(telemetryDto: TelemetryDto): Promise<any>;
}
export {};
