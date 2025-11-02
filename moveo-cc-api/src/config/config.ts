import dotenv from 'dotenv';
import { AppConfig } from '@/types';

// Load environment variables
dotenv.config();

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : (defaultValue ?? 0);
};

export const config: AppConfig = {
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3004),
  socketIOPort: getEnvNumber('SOCKET_IO_PORT', 3004),
  logLevel: getEnvVariable('LOG_LEVEL', 'info'),
  batchIntervalMs: getEnvNumber('BATCH_INTERVAL_MS', 3000),
  batchMaxSize: getEnvNumber('BATCH_MAX_SIZE', 100),
  socketIO: {
    pingInterval: getEnvNumber('SOCKET_IO_PING_INTERVAL', 25000),
    pingTimeout: getEnvNumber('SOCKET_IO_PING_TIMEOUT', 60000),
    maxHttpBufferSize: getEnvNumber('SOCKET_IO_MAX_HTTP_BUFFER_SIZE', 1e6),
  },
  moveoCore: {
    baseUrl: getEnvVariable('MOVEO_CORE_BASE_URL', 'http://localhost:3000'),
  },
};

// Validate configuration
const validateConfig = (): void => {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  if (config.batchIntervalMs < 100 || config.batchIntervalMs > 60000) {
    throw new Error('BATCH_INTERVAL_MS must be between 100 and 60000');
  }

  if (config.batchMaxSize < 1 || config.batchMaxSize > 10000) {
    throw new Error('BATCH_MAX_SIZE must be between 1 and 10000');
  }

  console.log('✅ Configuration validated successfully');
};

validateConfig();

export default config;

