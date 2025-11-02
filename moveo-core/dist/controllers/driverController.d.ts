import { Request, Response, NextFunction } from 'express';
export declare const driverController: {
    getAllDrivers(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getDriverById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createDriver(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateDriver(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteDriver(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getDriverShifts(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
};
//# sourceMappingURL=driverController.d.ts.map