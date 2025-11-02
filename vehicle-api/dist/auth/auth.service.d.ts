import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly httpService;
    private readonly configService;
    private moveoCore;
    constructor(httpService: HttpService, configService: ConfigService);
    driverLogin(email: string, password: string): Promise<any>;
}
