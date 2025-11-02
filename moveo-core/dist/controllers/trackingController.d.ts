import { Request, Response, NextFunction } from 'express';
export declare const trackingController: {
    updateLocation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentLocation(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getLocationHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLiveTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=trackingController.d.ts.map