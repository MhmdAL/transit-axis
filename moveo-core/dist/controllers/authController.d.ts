import { Request, Response, NextFunction } from 'express';
export declare const authController: {
    createUser(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    activateAccount(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    loginWithPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
};
//# sourceMappingURL=authController.d.ts.map