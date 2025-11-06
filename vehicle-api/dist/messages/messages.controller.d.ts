import { MessagesService } from './messages.service';
declare class SendMessageDto {
    vehicleId: string;
    sentByUserId: string;
    message: string;
    severity?: string;
    routeId?: string;
    tripId?: string;
}
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getVehicleMessages(vehicleId: string, limit: number | undefined, offset: number | undefined, authHeader: string): Promise<any>;
    sendMessage(sendMessageDto: SendMessageDto, authHeader: string): Promise<any>;
    getTemplates(authHeader: string): Promise<any>;
}
export {};
