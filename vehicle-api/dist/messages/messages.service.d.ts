import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class MessagesService {
    private readonly httpService;
    private readonly configService;
    private moveoCore;
    constructor(httpService: HttpService, configService: ConfigService);
    getVehicleMessages(vehicleId: string, limit: number | undefined, offset: number | undefined, authToken: string): Promise<any>;
    sendMessage(messageData: any, authToken: string): Promise<any>;
    getMessageTemplates(authToken: string): Promise<any>;
}
