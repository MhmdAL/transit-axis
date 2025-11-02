import { Request, Response, NextFunction } from 'express';
export declare const stopController: {
    getAllStops(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStopById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createStop(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=stopController.d.ts.map