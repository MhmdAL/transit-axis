// Global BigInt serialization - automatically converts BigInt to string
// This should be imported once at the start of your application

// Override JSON.stringify to handle BigInt values
const originalStringify = JSON.stringify;

JSON.stringify = function (value: any, replacer?: any, space?: any) {
  return originalStringify(value, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, space);
};

// Also provide a manual serializer for specific use cases
export const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
};