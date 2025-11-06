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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let MessagesService = class MessagesService {
    httpService;
    configService;
    moveoCore;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.moveoCore = this.configService.get('moveoCore.apiUrl') || 'http://localhost:3000';
    }
    async getVehicleMessages(vehicleId, limit = 50, offset = 0, authToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.moveoCore}/api/vehicle-messages/vehicle/${vehicleId}`, {
                params: { limit, offset },
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch messages from moveo-core');
        }
    }
    async sendMessage(messageData, authToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.moveoCore}/api/vehicle-messages`, messageData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send message to moveo-core');
        }
    }
    async getMessageTemplates(authToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.moveoCore}/api/vehicle-messages/templates/all`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch templates from moveo-core');
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map