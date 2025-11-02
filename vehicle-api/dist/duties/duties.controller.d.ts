import { DutiesService } from './duties.service';
export declare class DutiesController {
    private readonly dutiesService;
    constructor(dutiesService: DutiesService);
    getDuties(driverId: string, vehicleId: string, dutyType?: string, authHeader?: string): Promise<any>;
}
