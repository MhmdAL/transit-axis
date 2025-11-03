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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
class EndTripDto {
    timestamp;
}
let TripsService = class TripsService {
    httpService;
    configService;
    moveoCore;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.moveoCore = this.configService.get('moveoCore.apiUrl') || 'http://localhost:3000';
    }
    async startTrip(tripData, authToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.moveoCore}/api/trips`, tripData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to start trip in moveo-core');
        }
    }
    async endTrip(tripId, endTripDto, authToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.moveoCore}/api/trips/${tripId}/end`, endTripDto, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to end trip in moveo-core');
        }
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], TripsService);
//# sourceMappingURL=trips.service.js.map