import { Request, Response, NextFunction } from 'express';
export declare const vehicleModelController: {
    getAllVehicleModels(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchVehicleModels(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getVehicleModelById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createVehicleModel(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateVehicleModel(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteVehicleModel(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=vehicleModelController.d.ts.map