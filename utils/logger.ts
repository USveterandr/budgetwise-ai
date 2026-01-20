/**
 * Production-safe logging utility
 * Logs are only shown in development mode
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = __DEV__;

  log(...args: any[]) {
    if (this.isDev) {
      console.log('[BudgetWise]', ...args);
    }
  }

  info(...args: any[]) {
    if (this.isDev) {
      console.info('[BudgetWise]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDev) {
      console.warn('[BudgetWise]', ...args);
    }
  }

  error(...args: any[]) {
    // Always log errors, even in production
    console.error('[BudgetWise]', ...args);
    
    // In production, you might want to send errors to a service like Sentry
    if (!this.isDev) {
      // TODO: Send to error tracking service
      // Sentry.captureException(args[0]);
    }
  }

  debug(...args: any[]) {
    if (this.isDev) {
      console.debug('[BudgetWise DEBUG]', ...args);
    }
  }
}

export const logger = new Logger();
