import { Request, Response, NextFunction } from 'express';
export declare const routeController: {
    getAllRoutes(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRouteById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    createRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRouteStops(req: Request, res: Response, next: NextFunction): Promise<void>;
    addStopToRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRouteStop(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeStopFromRoute(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=routeController.d.ts.map