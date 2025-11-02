import { Request, Response, NextFunction } from 'express';
export declare const tripController: {
    getAllTrips(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTripById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignDriverToTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignVehicleToTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    startTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    endTrip(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTripStops(req: Request, res: Response, next: NextFunction): Promise<void>;
    arriveAtStop(req: Request, res: Response, next: NextFunction): Promise<void>;
    departFromStop(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=tripController.d.ts.map