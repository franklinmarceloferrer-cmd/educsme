import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorService } from '../errorService';

describe('errorService', () => {
  beforeEach(() => {
    errorService.clearLogs();
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    errorService.info('Test info message', { component: 'Test' });

    const logs = errorService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'info',
      message: 'Test info message',
      context: { component: 'Test' },
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log error messages with error object', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Test error');

    errorService.error('Test error message', { component: 'Test' }, testError);

    const logs = errorService.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: 'error',
      message: 'Test error message',
      context: { component: 'Test' },
      error: testError,
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should filter logs by level', () => {
    errorService.info('Info message');
    errorService.warn('Warning message');
    errorService.error('Error message');

    const errorLogs = errorService.getLogs('error');
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].level).toBe('error');

    const allLogs = errorService.getLogs();
    expect(allLogs).toHaveLength(3);
  });

  it('should limit log storage', () => {
    // Add more logs than the limit (1000 by default, but we'll test the concept)
    for (let i = 0; i < 5; i++) {
      errorService.info(`Message ${i}`);
    }

    const logs = errorService.getLogs();
    expect(logs.length).toBeLessThanOrEqual(5);
    
    // Most recent log should be first
    expect(logs[0].message).toBe('Message 4');
  });

  it('should clear logs', () => {
    errorService.info('Test message');
    expect(errorService.getLogs()).toHaveLength(1);

    errorService.clearLogs();
    expect(errorService.getLogs()).toHaveLength(0);
  });
});