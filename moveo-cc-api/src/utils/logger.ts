import { ILogger } from '@/types';
import config from '@/config/config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: { [key in LogLevel]: number } = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getLogLevelNumber = (level: string): number => {
  return LOG_LEVELS[level as LogLevel] ?? LOG_LEVELS.info;
};

const getCurrentLogLevel = (): number => {
  return getLogLevelNumber(config.logLevel);
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatLog = (level: string, message: string, data?: any): string => {
  const timestamp = formatTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
};

class Logger implements ILogger {
  debug(message: string, data?: any): void {
    if (getCurrentLogLevel() <= LOG_LEVELS.debug) {
      console.debug(formatLog('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (getCurrentLogLevel() <= LOG_LEVELS.info) {
      console.info(formatLog('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (getCurrentLogLevel() <= LOG_LEVELS.warn) {
      console.warn(formatLog('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (getCurrentLogLevel() <= LOG_LEVELS.error) {
      const errorData = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error;
      console.error(formatLog('error', message, errorData));
    }
  }
}

export const logger = new Logger();

export default logger;

