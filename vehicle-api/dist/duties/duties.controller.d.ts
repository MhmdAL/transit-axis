import { DutiesService } from './duties.service';
export declare class DutiesController {
    private readonly dutiesService;
    constructor(dutiesService: DutiesService);
    getDuties(driverId: string, vehicleId: string, dutyType?: string, date?: string, authHeader?: string): Promise<any>;
}
