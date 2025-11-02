"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBigInt = void 0;
const originalStringify = JSON.stringify;
JSON.stringify = function (value, replacer, space) {
    return originalStringify(value, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }, space);
};
const serializeBigInt = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(exports.serializeBigInt);
    }
    if (typeof obj === 'object') {
        const serialized = {};
        for (const [key, value] of Object.entries(obj)) {
            serialized[key] = (0, exports.serializeBigInt)(value);
        }
        return serialized;
    }
    return obj;
};
exports.serializeBigInt = serializeBigInt;
//# sourceMappingURL=bigIntSerializer.js.map