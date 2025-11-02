import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        type: 'user' | 'driver';
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map