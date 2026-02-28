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
 * Custom error class for skill installation with friendly messages
 */
export class SkillInstallationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly operation: 'read_skills' | 'create_dir' | 'copy_skill' | 'create_zip' = 'read_skills'
  ) {
    super(message);
    this.name = 'SkillInstallationError';
  }
}

/**
 * Get a friendly error message for skill installation
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
 * Get the skills source directory
 */
function getSkillsSourceDir(): string {
  return path.join(__dirname, '..', 'templates', 'skills');
}

/**
 * Get list of skills in the skills/ directory
 */
function getSkillsList(): string[] {
  const skillsDir = getSkillsSourceDir();
  if (!fs.existsSync(skillsDir)) {
    return [];
  }
  
  try {
    return fs.readdirSync(skillsDir).filter(item => {
      const itemPath = path.join(skillsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  } catch (error) {
    throw new SkillInstallationError(
      getFriendlyErrorMessage(error as Error, 'reading skills directory'),
      (error as any)?.code,
      'read_skills'
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
      throw new SkillInstallationError(
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
          throw new SkillInstallationError(
            getFriendlyErrorMessage(error as Error, `copying skill file: ${entry.name}`),
            (error as any)?.code,
            'copy_skill'
          );
        }
      }
    }
  } catch (error) {
    throw new SkillInstallationError(
      getFriendlyErrorMessage(error as Error, 'reading source directory'),
      (error as any)?.code,
      'copy_skill'
    );
  }
}

/**
 * Copy a skill directory to a target location
 */
function copySkillDir(skillName: string, targetDir: string): boolean {
  const sourceDir = path.join(getSkillsSourceDir(), skillName);
  const targetPath = path.join(targetDir, skillName);
  
  if (!fs.existsSync(sourceDir)) {
    return false;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (error) {
      throw new SkillInstallationError(
        getFriendlyErrorMessage(error as Error, 'creating skills directory'),
        (error as any)?.code,
        'create_dir'
      );
    }
  }
  
  // Remove existing skill if it exists
  if (fs.existsSync(targetPath)) {
    try {
      fs.rmSync(targetPath, { recursive: true });
    } catch (error) {
      throw new SkillInstallationError(
        getFriendlyErrorMessage(error as Error, 'removing existing skill directory'),
        (error as any)?.code,
        'create_dir'
      );
    }
  }
  
  // Copy the skill directory
  try {
    copyDirRecursive(sourceDir, targetPath);
    return true;
  } catch (error) {
    throw new SkillInstallationError(
      getFriendlyErrorMessage(error as Error, `installing skill: ${skillName}`),
      (error as any)?.code,
      'copy_skill'
    );
  }
}

/**
 * Install skills to OpenCode
 * Target: .opencode/skills/ (project-level directory)
 */
export function installToOpenCode(): InstallResult {
  const projectDir = process.cwd();
  const targetDir = path.join(projectDir, '.opencode', 'skills');
  
  const skills = getSkillsList();
  if (skills.length === 0) {
    return { success: false, message: 'No skills found in skills/ directory' };
  }
  
  let installedCount = 0;
  let lastError: Error | null = null;
  
  for (const skill of skills) {
    try {
      if (copySkillDir(skill, targetDir)) {
        installedCount++;
      }
    } catch (error) {
      lastError = error as Error;
      // Continue with other skills even if one fails
    }
  }
  
  if (installedCount === 0 && lastError) {
    return { success: false, message: lastError.message };
  }
  
  return {
    success: true,
    message: `Installed ${installedCount} skill(s) to OpenCode`,
    path: targetDir
  };
}

/**
 * Install skills to Qwen Code
 * Target: .qwen/skills/ (project-level directory)
 */
export function installToQwenCode(): InstallResult {
  const projectDir = process.cwd();
  const targetDir = path.join(projectDir, '.qwen', 'skills');
  
  const skills = getSkillsList();
  if (skills.length === 0) {
    return { success: false, message: 'No skills found in skills/ directory' };
  }
  
  let installedCount = 0;
  let lastError: Error | null = null;
  
  for (const skill of skills) {
    try {
      if (copySkillDir(skill, targetDir)) {
        installedCount++;
      }
    } catch (error) {
      lastError = error as Error;
      // Continue with other skills even if one fails
    }
  }
  
  if (installedCount === 0 && lastError) {
    return { success: false, message: lastError.message };
  }
  
  return {
    success: true,
    message: `Installed ${installedCount} skill(s) to Qwen Code`,
    path: targetDir
  };
}

/**
 * Install skills to multiple AI assistants
 * @param targets Array of target assistant names ('opencode', 'qwen-code')
 */
export async function installSkills(targets: string[]): Promise<InstallResult[]> {
  const results: InstallResult[] = [];
  
  for (const target of targets) {
    switch (target) {
      case 'opencode':
        results.push(installToOpenCode());
        break;
      case 'qwen-code':
        results.push(installToQwenCode());
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
 * Returns project-level skill directory path
 */
export function getAssistantSkillsPath(assistant: string): string | null {
  const projectDir = process.cwd();
  
  const paths: Record<string, string> = {
    'opencode': path.join(projectDir, '.opencode', 'skills'),
    'qwen-code': path.join(projectDir, '.qwen', 'skills')
  };
  
  return paths[assistant] || null;
}
