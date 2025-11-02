import { Request, Response, NextFunction } from 'express';
export declare const vehicleController: {
    getAllVehicles(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVehicleById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVehicleLocation(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getVehicleTelemetry(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=vehicleController.d.ts.map