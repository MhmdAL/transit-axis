"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    apiDocsPath: process.env.API_DOCS_PATH || '/api-docs',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
};
//# sourceMappingURL=config.js.map