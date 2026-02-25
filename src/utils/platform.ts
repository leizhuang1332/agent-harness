/**
 * Platform detection utilities for cross-platform compatibility
 */

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Check if running on Linux
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * Get current platform identifier
 */
export function getPlatform(): string {
  return process.platform;
}
