import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InstallResult {
  success: boolean;
  message: string;
  path?: string;
}

/**
 * Custom error class for command installation with friendly messages
 */
export class CommandInstallationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly operation: 'read_commands' | 'create_dir' | 'copy_command' | 'create_zip' = 'read_commands'
  ) {
    super(message);
    this.name = 'CommandInstallationError';
  }
}

/**
 * Get a friendly error message for command installation
 */
function getFriendlyErrorMessage(error: Error, operation: string): string {
  const err = error as any;
  
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
  
  return `An error occurred while ${operation}. Please try again.`;
}

/**
 * Get the commands source directory
 */
export function getCommandsSourceDir(): string {
  return path.join(__dirname, '..', 'templates', 'commands');
}

/**
 * Get list of commands in the commands/ directory
 */
export function getCommandsList(): string[] {
  const commandsDir = getCommandsSourceDir();
  if (!fs.existsSync(commandsDir)) {
    return [];
  }
  
  try {
    return fs.readdirSync(commandsDir).filter(item => {
      const itemPath = path.join(commandsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  } catch (error) {
    throw new CommandInstallationError(
      getFriendlyErrorMessage(error as Error, 'reading commands directory'),
      (error as any)?.code,
      'read_commands'
    );
  }
}

/**
 * Recursively copy a directory
 */
function copyDirRecursive(source: string, target: string): void {
  if (!fs.existsSync(target)) {
    try {
      fs.mkdirSync(target, { recursive: true });
    } catch (error) {
      throw new CommandInstallationError(
        getFriendlyErrorMessage(error as Error, 'creating target directory'),
        (error as any)?.code,
        'create_dir'
      );
    }
  }
  
  try {
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else {
        try {
          fs.copyFileSync(srcPath, destPath);
        } catch (error) {
          throw new CommandInstallationError(
            getFriendlyErrorMessage(error as Error, `copying command file: ${entry.name}`),
            (error as any)?.code,
            'copy_command'
          );
        }
      }
    }
  } catch (error) {
    throw new CommandInstallationError(
      getFriendlyErrorMessage(error as Error, 'reading source directory'),
      (error as any)?.code,
      'copy_command'
    );
  }
}

/**
 * Copy a command directory to a target location
 */
function copyCommandDir(commandName: string, targetDir: string): boolean {
  const sourceDir = path.join(getCommandsSourceDir(), commandName);
  const targetPath = path.join(targetDir, commandName);
  
  if (!fs.existsSync(sourceDir)) {
    return false;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (error) {
      throw new CommandInstallationError(
        getFriendlyErrorMessage(error as Error, 'creating commands directory'),
        (error as any)?.code,
        'create_dir'
      );
    }
  }
  
  // Remove existing command if it exists
  if (fs.existsSync(targetPath)) {
    try {
      fs.rmSync(targetPath, { recursive: true });
    } catch (error) {
      throw new CommandInstallationError(
        getFriendlyErrorMessage(error as Error, 'removing existing command directory'),
        (error as any)?.code,
        'create_dir'
      );
    }
  }
  
  // Copy the command directory
  try {
    copyDirRecursive(sourceDir, targetPath);
    return true;
  } catch (error) {
    throw new CommandInstallationError(
      getFriendlyErrorMessage(error as Error, `installing command: ${commandName}`),
      (error as any)?.code,
      'copy_command'
    );
  }
}

/**
 * Install commands to OpenCode
 * Target: .opencode/commands/ (project-level directory)
 */
export function installToOpenCodeCommands(): InstallResult {
  const projectDir = process.cwd();
  const targetDir = path.join(projectDir, '.opencode', 'commands');
  
  const commands = getCommandsList();
  if (commands.length === 0) {
    return { success: false, message: 'No commands found in commands/ directory' };
  }
  
  let installedCount = 0;
  let lastError: Error | null = null;
  
  for (const command of commands) {
    try {
      if (copyCommandDir(command, targetDir)) {
        installedCount++;
      }
    } catch (error) {
      lastError = error as Error;
      // Continue with other commands even if one fails
    }
  }
  
  if (installedCount === 0 && lastError) {
    return { success: false, message: lastError.message };
  }
  
  return {
    success: true,
    message: `Installed ${installedCount} command(s) to OpenCode`,
    path: targetDir
  };
}

/**
 * Install commands to Qwen Code
 * Target: .qwen/commands/ (project-level directory)
 */
export function installToQwenCodeCommands(): InstallResult {
  const projectDir = process.cwd();
  const targetDir = path.join(projectDir, '.qwen', 'commands');
  
  const commands = getCommandsList();
  if (commands.length === 0) {
    return { success: false, message: 'No commands found in commands/ directory' };
  }
  
  let installedCount = 0;
  let lastError: Error | null = null;
  
  for (const command of commands) {
    try {
      if (copyCommandDir(command, targetDir)) {
        installedCount++;
      }
    } catch (error) {
      lastError = error as Error;
      // Continue with other commands even if one fails
    }
  }
  
  if (installedCount === 0 && lastError) {
    return { success: false, message: lastError.message };
  }
  
  return {
    success: true,
    message: `Installed ${installedCount} command(s) to Qwen Code`,
    path: targetDir
  };
}

/**
 * Install commands to multiple AI assistants
 * @param targets Array of target assistant names ('opencode', 'qwen-code')
 */
export async function installCommands(targets: string[]): Promise<InstallResult[]> {
  const results: InstallResult[] = [];
  
  for (const target of targets) {
    switch (target) {
      case 'opencode':
        results.push(installToOpenCodeCommands());
        break;
      case 'qwen-code':
        results.push(installToQwenCodeCommands());
        break;
      default:
        results.push({
          success: false,
          message: `Unknown target: ${target}`
        });
    }
  }
  
  return results;
}

/**
 * Get installation info for a specific assistant
 * Returns project-level command directory path
 */
export function getAssistantCommandsPath(assistant: string): string | null {
  const projectDir = process.cwd();
  
  const paths: Record<string, string> = {
    'opencode': path.join(projectDir, '.opencode', 'commands'),
    'qwen-code': path.join(projectDir, '.qwen', 'commands')
  };
  
  return paths[assistant] || null;
}
