/**
 * File Writer with Template Support
 * Handles file creation, directory creation, and template variable replacement
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export interface WriteOptions {
  /** Force overwrite existing file without warning */
  force?: boolean;
  /** Log output to console */
  verbose?: boolean;
  /** Variables for template replacement */
  templateVars?: Record<string, string>;
}

export interface EnsureDirOptions {
  /** Log output to console */
  verbose?: boolean;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Replace template variables in content
 * Supports {{variableName}} syntax
 */
export function replaceTemplateVars(
  content: string,
  vars: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(
  dirPath: string,
  options?: EnsureDirOptions
): Promise<void> {
  const resolvedPath = path.resolve(dirPath);

  try {
    await fs.mkdir(resolvedPath, { recursive: true });
    if (options?.verbose) {
      logger.success(`Directory created: ${resolvedPath}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create directory ${resolvedPath}: ${message}`);
  }
}

/**
 * Write content to a file
 *
 * @param filePath - Target file path (relative or absolute)
 * @param content - File content
 * @param options - Write options
 * @returns Promise<void>
 */
export async function writeFile(
  filePath: string,
  content: string,
  options?: WriteOptions
): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  const { force = false, verbose = false, templateVars } = options || {};

  // Apply template variable replacement if vars provided
  let finalContent = content;
  if (templateVars && Object.keys(templateVars).length > 0) {
    finalContent = replaceTemplateVars(content, templateVars);
    if (verbose) {
      logger.info(`Applied template variables to ${resolvedPath}`);
    }
  }

  // Check if file already exists
  const exists = await fileExists(resolvedPath);
  if (exists && !force) {
    throw new Error(
      `File already exists: ${resolvedPath}. Use force: true to overwrite.`
    );
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(resolvedPath);
  try {
    await fs.mkdir(parentDir, { recursive: true });
  } catch {
    // Directory may already exist, ignore error
  }

  // Write the file
  try {
    await fs.writeFile(resolvedPath, finalContent, 'utf-8');
    if (verbose) {
      logger.success(`File written: ${resolvedPath}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to write file ${resolvedPath}: ${message}`);
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath);
  return fs.readFile(resolvedPath, 'utf-8');
}

/**
 * Copy a file from source to destination
 */
export async function copyFile(
  srcPath: string,
  destPath: string,
  options?: WriteOptions
): Promise<void> {
  const { force = false, verbose = false } = options || {};
  const resolvedSrc = path.resolve(srcPath);
  const resolvedDest = path.resolve(destPath);

  // Check if source exists
  if (!(await fileExists(resolvedSrc))) {
    throw new Error(`Source file does not exist: ${resolvedSrc}`);
  }

  // Check if destination exists
  const exists = await fileExists(resolvedDest);
  if (exists && !force) {
    throw new Error(
      `Destination file already exists: ${resolvedDest}. Use force: true to overwrite.`
    );
  }

  // Ensure parent directory exists
  const parentDir = path.dirname(resolvedDest);
  try {
    await fs.mkdir(parentDir, { recursive: true });
  } catch {
    // Directory may already exist, ignore error
  }

  // Copy the file
  try {
    await fs.copyFile(resolvedSrc, resolvedDest);
    if (verbose) {
      logger.success(`File copied: ${resolvedSrc} -> ${resolvedDest}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to copy file to ${resolvedDest}: ${message}`);
  }
}

export default {
  writeFile,
  readFile,
  copyFile,
  ensureDir,
  replaceTemplateVars,
};
