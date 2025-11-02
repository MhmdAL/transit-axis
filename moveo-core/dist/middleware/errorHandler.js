"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const { statusCode = 500, message } = err;
    console.error('Error:', {
        message,
        statusCode,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });
    res.status(statusCode).json({
        success: false,
        error: {
            message: statusCode === 500 ? 'Internal Server Error' : message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map