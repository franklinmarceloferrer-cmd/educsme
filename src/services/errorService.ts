export type ErrorLevel = 'info' | 'warn' | 'error' | 'critical';

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: ErrorLevel;
  message: string;
  context?: ErrorContext;
  timestamp: Date;
  error?: Error;
}

class ErrorService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(level: ErrorLevel, message: string, context?: ErrorContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      error,
    };

    this.logs.unshift(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      const contextStr = context ? JSON.stringify(context, null, 2) : '';
      const errorStr = error ? error.stack || error.message : '';
      
      switch (level) {
        case 'info':
          console.info(`[${level.toUpperCase()}] ${message}`, contextStr);
          break;
        case 'warn':
          console.warn(`[${level.toUpperCase()}] ${message}`, contextStr);
          break;
        case 'error':
        case 'critical':
          console.error(`[${level.toUpperCase()}] ${message}`, contextStr, errorStr);
          break;
      }
    }

    // In production, you might want to send to an external service
    if (import.meta.env.PROD && (level === 'error' || level === 'critical')) {
      this.reportToExternalService(entry);
    }
  }

  info(message: string, context?: ErrorContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: ErrorContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: ErrorContext, error?: Error) {
    this.log('error', message, context, error);
  }

  critical(message: string, context?: ErrorContext, error?: Error) {
    this.log('critical', message, context, error);
  }

  getLogs(level?: ErrorLevel): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  private reportToExternalService(entry: LogEntry) {
    // Implement external error reporting service integration
    // e.g., Sentry, LogRocket, etc.
    console.log('Reporting to external service:', entry);
  }
}

export const errorService = new ErrorService();

// Helper functions for common error scenarios
export const logApiError = (action: string, error: Error, context?: Partial<ErrorContext>) => {
  errorService.error(`API Error during ${action}`, {
    action,
    component: 'API',
    ...context,
  }, error);
};

export const logAuthError = (action: string, error: Error, context?: Partial<ErrorContext>) => {
  errorService.error(`Auth Error during ${action}`, {
    action,
    component: 'Auth',
    ...context,
  }, error);
};

export const logValidationError = (field: string, value: any, context?: Partial<ErrorContext>) => {
  errorService.warn(`Validation Error for field: ${field}`, {
    action: 'validation',
    component: 'Form',
    metadata: { field, value },
    ...context,
  });
};
