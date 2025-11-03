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
exports.DutiesController = void 0;
const common_1 = require("@nestjs/common");
const duties_service_1 = require("./duties.service");
let DutiesController = class DutiesController {
    dutiesService;
    constructor(dutiesService) {
        this.dutiesService = dutiesService;
    }
    async getDuties(driverId, vehicleId, dutyType, date, authHeader) {
        try {
            if (!authHeader) {
                throw new common_1.HttpException('Authorization header required', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (!driverId || !vehicleId) {
                throw new common_1.HttpException('driverId and vehicleId are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const token = authHeader.replace('Bearer ', '');
            const result = await this.dutiesService.getDuties(driverId, vehicleId, dutyType, date, token);
            return result;
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to fetch duties', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.DutiesController = DutiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('driverId')),
    __param(1, (0, common_1.Query)('vehicleId')),
    __param(2, (0, common_1.Query)('dutyType')),
    __param(3, (0, common_1.Query)('date')),
    __param(4, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DutiesController.prototype, "getDuties", null);
exports.DutiesController = DutiesController = __decorate([
    (0, common_1.Controller)('duties'),
    __metadata("design:paramtypes", [duties_service_1.DutiesService])
], DutiesController);
//# sourceMappingURL=duties.controller.js.map