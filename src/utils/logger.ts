import chalk from 'chalk';
import ora, { Ora } from 'ora';

export type LogLevel = 'info' | 'success' | 'error' | 'warn';

interface Logger {
  info: (message: string) => void;
  success: (message: string) => void;
  error: (message: string, exit?: boolean) => void;
  warn: (message: string) => void;
  spinner: (text: string) => Ora;
}

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] || '00:00:00';
  
  const prefixes: Record<LogLevel, string> = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warn: '⚠',
  };
  
  return `[${timestamp}] ${prefixes[level]} ${message}`;
}

function logInfo(message: string): void {
  console.log(chalk.blue(formatMessage('info', message)));
}

function logSuccess(message: string): void {
  console.log(chalk.green(formatMessage('success', message)));
}

function logError(message: string, exit = false): void {
  console.error(chalk.red(formatMessage('error', message)));
  if (exit) {
    process.exit(1);
  }
}

function logWarn(message: string): void {
  console.warn(chalk.yellow(formatMessage('warn', message)));
}

function createSpinner(text: string): Ora {
  return ora({
    text: chalk.blue(text),
    spinner: 'dots',
  });
}

export const logger: Logger = {
  info: logInfo,
  success: logSuccess,
  error: logError,
  warn: logWarn,
  spinner: createSpinner,
};

export function withErrorHandling<T>(
  fn: () => Promise<T> | T,
  exitOnError = true
): Promise<T | void> {
  return Promise.resolve()
    .then(() => fn())
    .catch((err: Error) => {
      logError(err.message, exitOnError);
      if (!exitOnError) {
        throw err;
      }
    });
}

export default logger;
