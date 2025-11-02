"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['debug', 'error', 'log', 'warn', 'verbose'],
    });
    app.enableCors();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') || 3002;
    const logger = new common_1.Logger('VehicleAPI');
    await app.listen(port);
    logger.debug(`VehicleAPI is running on: http://localhost:${port}`);
    logger.debug('Debug logging enabled');
}
bootstrap();
//# sourceMappingURL=main.js.map