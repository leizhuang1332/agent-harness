import path from 'path';
import { fileURLToPath } from 'url';
import { isWindows } from './platform.js';

/**
 * Path utilities for cross-platform compatibility
 */

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  // Get current file's directory (src/utils)
  const currentFilePath = fileURLToPath(import.meta.url);
  const utilsDir = path.dirname(currentFilePath);
  // Go up from src/utils to project root
  return path.resolve(utilsDir, '../..');
}

/**
 * Resolve a path relative to project root
 */
export function resolvePath(relativePath: string): string {
  return path.resolve(getProjectRoot(), relativePath);
}

/**
 * Resolve a path relative to src directory
 */
export function resolveSrcPath(relativePath: string): string {
  return path.resolve(getProjectRoot(), 'src', relativePath);
}

/**
 * Get the appropriate path separator for current OS
 */
export function getPathSeparator(): string {
  return isWindows() ? '\\' : '/';
}
