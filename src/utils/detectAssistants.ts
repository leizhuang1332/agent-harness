import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * AI Assistant information
 */
export interface AIAssistant {
  name: string;
  installed: boolean;
  path?: string;
  version?: string;
}

/**
 * Get the home directory path
 */
function getHomeDir(): string {
  return os.homedir();
}

/**
 * Check if OpenCode is installed
 * Checks: ~/.config/opencode/ directory or which opencode command
 */
export function checkOpenCodeInstalled(): AIAssistant {
  const homeDir = getHomeDir();
  const opencodeConfigPath = path.join(homeDir, '.config', 'opencode');
  
  let installed = fs.existsSync(opencodeConfigPath);
  let version: string | undefined;
  
  // Also try to get version from command
  if (installed) {
    try {
      const output = execSync('opencode --version', { encoding: 'utf-8', timeout: 5000 });
      version = output.trim();
    } catch {
      // Command might not support --version
    }
  }
  
  return {
    name: 'OpenCode',
    installed,
    path: installed ? opencodeConfigPath : undefined,
    version
  };
}

/**
 * Check if Claude Desktop is installed
 * Checks: ~/Library/Application Support/Claude/ or ~/.config/claude/
 */
export function checkClaudeDesktopInstalled(): AIAssistant {
  const homeDir = getHomeDir();
  const platform = process.platform;
  
  let claudePath: string;
  
  if (platform === 'darwin') {
    // macOS
    claudePath = path.join(homeDir, 'Library', 'Application Support', 'Claude');
  } else if (platform === 'win32') {
    // Windows
    claudePath = path.join(homeDir, 'AppData', 'Roaming', 'Claude');
  } else {
    // Linux/other
    claudePath = path.join(homeDir, '.config', 'Claude');
  }
  
  const installed = fs.existsSync(claudePath);
  
  return {
    name: 'Claude Desktop',
    installed,
    path: installed ? claudePath : undefined
  };
}

/**
 * Check if Cursor is installed
 * Checks: ~/.cursor/ directory
 */
export function checkCursorInstalled(): AIAssistant {
  const homeDir = getHomeDir();
  const cursorPath = path.join(homeDir, '.cursor');
  
  const installed = fs.existsSync(cursorPath);
  
  return {
    name: 'Cursor',
    installed,
    path: installed ? cursorPath : undefined
  };
}

/**
 * Check if Qwen Code is installed
 * Checks: runs qwen-code --version command
 */
export function checkQwenCodeInstalled(): AIAssistant {
  let version: string | undefined;
  let installed = false;
  
  try {
    const output = execSync('qwen-code --version', { encoding: 'utf-8', timeout: 5000 });
    version = output.trim();
    installed = true;
  } catch {
    // Try alternative command
    try {
      const output = execSync('qwen --version', { encoding: 'utf-8', timeout: 5000 });
      version = output.trim();
      installed = true;
    } catch {
      installed = false;
    }
  }
  
  return {
    name: 'Qwen Code',
    installed,
    version
  };
}

/**
 * Get all installed AI assistants
 * @returns Array of AIAssistant objects
 */
export function getInstalledAssistants(): AIAssistant[] {
  const assistants: AIAssistant[] = [
    checkOpenCodeInstalled(),
    checkClaudeDesktopInstalled(),
    checkCursorInstalled(),
    checkQwenCodeInstalled()
  ];
  
  return assistants;
}

/**
 * Get only installed AI assistant names
 * @returns Array of installed assistant names
 */
export function getInstalledAssistantNames(): string[] {
  const assistants = getInstalledAssistants();
  return assistants
    .filter(assistant => assistant.installed)
    .map(assistant => assistant.name);
}
