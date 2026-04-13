// src/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  path?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, metadata: Record<string, any> = {}) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // همیشه در کنسول نمایش بده (برای توسعه)
    console[level === 'error' ? 'error' : level](`[${level.toUpperCase()}]`, message, metadata);

    // در محیط Production می‌توانی به سرویس خارجی (Sentry, Logtail, Datadog و ...) بفرستی
    if (this.isProduction && level === 'error') {
      // مثال: ارسال به Sentry یا Logtail
      // await sendToExternalService(entry);
      console.error('Production Error Logged:', entry);
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: unknown, metadata?: Record<string, any>) {
    const errorInfo = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    this.log('error', message, { ...metadata, error: errorInfo });
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (!this.isProduction) {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = new Logger();