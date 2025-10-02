import fs from 'fs';
import path from 'path';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class Logger {
  private logLevel: LogLevel;
  private logFilePath: string;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.logFilePath = path.join(process.cwd(), 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logFilePath)) {
      fs.mkdirSync(this.logFilePath, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta
    };
    
    return JSON.stringify(logEntry);
  }

  private writeToFile(level: LogLevel, message: string, meta?: any): void {
    if (!this.shouldLog(level)) return;
    
    const logMessage = this.formatMessage(level, message, meta);
    const fileName = `${new Date().toISOString().split('T')[0]}.log`;
    const filePath = path.join(this.logFilePath, fileName);
    
    try {
      fs.appendFileSync(filePath, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta || '');
      this.writeToFile(LogLevel.ERROR, message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
      this.writeToFile(LogLevel.WARN, message, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
      this.writeToFile(LogLevel.INFO, message, meta);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
      this.writeToFile(LogLevel.DEBUG, message, meta);
    }
  }
}

export const logger = new Logger();