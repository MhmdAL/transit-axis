"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
class SendMessageDto {
    vehicleId;
    sentByUserId;
    message;
    severity;
    routeId;
    tripId;
}
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async getVehicleMessages(vehicleId, limit = 50, offset = 0, authHeader) {
        try {
            if (!authHeader) {
                throw new common_1.HttpException('Authorization header required', common_1.HttpStatus.UNAUTHORIZED);
            }
            const token = authHeader.replace('Bearer ', '');
            const result = await this.messagesService.getVehicleMessages(vehicleId, limit, offset, token);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch messages', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendMessage(sendMessageDto, authHeader) {
        try {
            if (!authHeader) {
                throw new common_1.HttpException('Authorization header required', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!sendMessageDto.vehicleId || !sendMessageDto.sentByUserId || !sendMessageDto.message) {
                throw new common_1.HttpException('vehicleId, sentByUserId, and message are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const token = authHeader.replace('Bearer ', '');
            const result = await this.messagesService.sendMessage(sendMessageDto, token);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to send message', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getTemplates(authHeader) {
        try {
            if (!authHeader) {
                throw new common_1.HttpException('Authorization header required', common_1.HttpStatus.UNAUTHORIZED);
            }
            const token = authHeader.replace('Bearer ', '');
            const result = await this.messagesService.getMessageTemplates(token);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch templates', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('vehicle/:vehicleId'),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getVehicleMessages", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMessageDto, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getTemplates", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map