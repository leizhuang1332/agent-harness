import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom error class for file operations with friendly messages
 */
export class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly operation: 'create_dir' | 'copy_file' | 'check_exists' = 'check_exists'
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

/**
 * Get a friendly error message for file operations
 */
function getFriendlyErrorMessage(error: Error, operation: string): string {
  const err = error as any;
  
  // Handle specific error codes
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    return `Permission denied: Cannot ${operation}. Please check your file permissions.`;
  }
  
  if (err.code === 'ENOENT') {
    return `Required directory not found: Cannot access the parent directory.`;
  }
  
  if (err.code === 'ENOTDIR') {
    return `Invalid path: One of the path components is not a directory.`;
  }
  
  if (err.code === 'ENOSPC') {
    return `No space left on device: Cannot complete the operation.`;
  }
  
  if (err.code === 'EROFS') {
    return `Read-only file system: Cannot modify files in this location.`;
  }
  
  // Generic friendly message for unknown errors
  return `An error occurred while ${operation}. Please try again.`;
}

/**
 * Check if AGENTS.md exists in the current directory
 */
export function checkAgentsMdExists(): boolean {
  const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
  return fs.existsSync(agentsMdPath);
}

/**
 * Check if .agent-harness/ directory exists
 */
export function checkAgentHarnessDirExists(): boolean {
  const agentHarnessPath = path.join(process.cwd(), '.agent-harness');
  return fs.existsSync(agentHarnessPath) && fs.statSync(agentHarnessPath).isDirectory();
}

/**
 * Create .agent-harness/ directory if it doesn't exist
 * @returns True if directory was created, false if it already exists
 * @throws FileOperationError if directory creation fails
 */
export function createAgentHarnessDir(): boolean {
  const agentHarnessPath = path.join(process.cwd(), '.agent-harness');
  
  if (!fs.existsSync(agentHarnessPath)) {
    try {
      fs.mkdirSync(agentHarnessPath, { recursive: true });
      return true;
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error as Error, 'creating the .agent-harness directory');
      throw new FileOperationError(friendlyMessage, (error as any)?.code, 'create_dir');
    }
  }
  
  return false;
}

/**
 * Copy templates/AGENTS.md to current directory
 * @returns True if copy was successful, false if file already exists
 * @throws FileOperationError if copy fails
 */
export function copyAgentsMdTemplate(): boolean {
  const sourcePath = path.join(__dirname, '..', 'templates', 'AGENTS.md');
  const destPath = path.join(process.cwd(), 'AGENTS.md');
  
  // Create .agent-harness directory if it doesn't exist
  createAgentHarnessDir();

  // Don't overwrite existing file
  if (fs.existsSync(destPath)) {
    return false;
  }
  
  if (!fs.existsSync(sourcePath)) {
    throw new FileOperationError(
      'Template file not found. Please ensure the project is properly installed.',
      'ENOENT',
      'copy_file'
    );
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    const friendlyMessage = getFriendlyErrorMessage(error as Error, 'copying AGENTS.md template');
    throw new FileOperationError(friendlyMessage, (error as any)?.code, 'copy_file');
  }
}
