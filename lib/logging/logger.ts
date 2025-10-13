/**
 * @fileoverview logger Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

/**
 * Centralized logging utility for the application
 * Provides different log levels and environment-specific behavior
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * LoggerConfig Interface
 *
 * @interface LoggerConfig
 */
export interface LoggerConfig {
  level: LogLevel;
  prefix: string;
  enableConsole: boolean;
  enableAnalytics: boolean;
}

class Logger {
  private readonly config: LoggerConfig;
  private static instance: Logger;

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getEnvironmentLogLevel(),
      prefix: '[DernekYS]',
      enableConsole: this.shouldEnableConsole(),
      enableAnalytics: false,
      ...config,
    };
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  private getEnvironmentLogLevel(): LogLevel {
    if (typeof window === 'undefined') return LogLevel.INFO;

    // Production'da sadece error ve üstü
    if (import.meta.env.PROD) {
      return LogLevel.ERROR;
    }

    // Development'da debug ve üstü
    if (import.meta.env.DEV) {
      return LogLevel.DEBUG;
    }

    // Test ortamında sadece error
    if (import.meta.env.MODE === 'test') {
      return LogLevel.ERROR;
    }

    return LogLevel.INFO;
  }

  private shouldEnableConsole(): boolean {
    // Production'da console'u tamamen devre dışı bırak
    if (import.meta.env.PROD) {
      return false;
    }

    // Test ortamında console'u devre dışı bırak
    if (import.meta.env.MODE === 'test') {
      return false;
    }

    return true;
  }

  private formatMessage(level: string, message: string, ..._args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const { prefix } = this.config;
    return `[${timestamp}] ${prefix} [${level}] ${message}`;
  }

  private log(level: LogLevel, levelName: string, message: string, ...args: unknown[]): void {
    if (level < this.config.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, ...args);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, ...args);
          break;
      }
    }

    // Analytics'e gönder (isteğe bağlı)
    if (this.config.enableAnalytics && level >= LogLevel.ERROR) {
      this.sendToAnalytics(levelName, message, args);
    }
  }

  private sendToAnalytics(level: string, message: string, args: unknown[]): void {
    // Analytics gönderimi burada implemente edilecek
    // External analytics services can be integrated here
    // Example: Google Analytics, etc.
    // Currently no external analytics service is configured
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  // Store initialization için özel metod
  storeInit(message: string, ...args: unknown[]): void {
    this.info(`Store: ${message}`, ...args);
  }

  // API çağrıları için özel metod
  api(message: string, ...args: unknown[]): void {
    this.debug(`API: ${message}`, ...args);
  }

  // Hata ayıklama için özel metod
  dev(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      this.debug(`DEV: ${message}`, ...args);
    }
  }
}

// Default logger instance
export const logger = Logger.getInstance();

// Convenience functions for different modules
export const storeLogger = {
  init: (message: string, ...args: unknown[]): void => {
    logger.storeInit(message, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    logger.log(LogLevel.ERROR, 'ERROR', `Store: ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    logger.log(LogLevel.WARN, 'WARN', `Store: ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]): void => {
    logger.log(LogLevel.INFO, 'INFO', `Store: ${message}`, ...args);
  },
};

export const apiLogger = {
  request: (url: string, method: string, ...args: unknown[]): void => {
    logger.api(`${method} ${url}`, ...args);
  },
  response: (url: string, status: number, ...args: unknown[]): void => {
    logger.api(`Response ${status} from ${url}`, ...args);
  },
  error: (url: string, error: unknown, ...args: unknown[]): void => {
    logger.log(LogLevel.ERROR, 'ERROR', `API Error on ${url}: ${String(error)}`, ...args);
  },
};

export const authLogger = {
  login: (userId: string, ...args: unknown[]): void => {
    logger.log(LogLevel.INFO, 'INFO', `User login: ${userId}`, ...args);
  },
  logout: (userId: string, ...args: unknown[]): void => {
    logger.log(LogLevel.INFO, 'INFO', `User logout: ${userId}`, ...args);
  },
  info: (message: string, ...args: unknown[]): void => {
    logger.log(LogLevel.INFO, 'INFO', `Auth: ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    logger.log(LogLevel.WARN, 'WARN', `Auth: ${message}`, ...args);
  },
  error: (action: string, error: unknown, ...args: unknown[]): void => {
    logger.log(LogLevel.ERROR, 'ERROR', `Auth error on ${action}: ${String(error)}`, ...args);
  },
};
export default logger;
