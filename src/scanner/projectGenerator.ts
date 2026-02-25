/**
 * Project Generator
 * Combines scan results and tech stack detection to generate project.md
 */

import { scanProject, ProjectMetadata } from './scanner.js';
import { detectTechStack, TechStack } from './techStack.js';
import { generateProjectTemplate, ProjectInfo } from '../generators/project.js';
import path from 'path';

export interface CombinedProjectInfo extends ProjectInfo {
  metadata: ProjectMetadata;
  techStackInfo: TechStack;
}

/**
 * Generate combined project information from scan and tech stack detection
 */
export async function generateProjectInfo(rootPath?: string): Promise<CombinedProjectInfo> {
  const targetPath = rootPath || process.cwd();

  // Run scan and tech stack detection in parallel
  const [metadata, techStackInfo] = await Promise.all([
    scanProject(targetPath),
    detectTechStack(targetPath),
  ]);

  // Combine tech stack info
  const techStack: string[] = [];

  // Add languages
  if (techStackInfo.languages.length > 0) {
    techStack.push(...techStackInfo.languages);
  }

  // Add frameworks
  if (techStackInfo.frameworks.length > 0) {
    techStack.push(...techStackInfo.frameworks.map((f) => `${f} framework`));
  }

  // Add runtimes
  if (techStackInfo.runtimes.length > 0) {
    techStack.push(...techStackInfo.runtimes.map((r) => `${r} runtime`));
  }

  // Add tools
  if (techStackInfo.tools.length > 0) {
    techStack.push(...techStackInfo.tools);
  }

  // Get project name from package.json or directory name
  let projectName = path.basename(targetPath);
  try {
    const packageJsonPath = path.join(targetPath, 'package.json');
    const packageJson = await import('fs').then((fs) => {
      try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      } catch {
        return null;
      }
    });
    if (packageJson && packageJson.name) {
      projectName = packageJson.name;
    }
  } catch {
    // Use directory name as fallback
  }

  // Build commands from detected project type
  const commands: Record<string, string> = {};
  if (metadata.rootFiles.includes('package.json')) {
    commands['npm install'] = 'Install dependencies';
    commands['npm run build'] = 'Build the project';
    commands['npm run dev'] = 'Start development server';
    commands['npm test'] = 'Run tests';
  } else if (metadata.rootFiles.includes('pyproject.toml') || metadata.rootFiles.includes('requirements.txt')) {
    commands['pip install -r requirements.txt'] = 'Install dependencies';
    commands['python -m pytest'] = 'Run tests';
  } else if (metadata.rootFiles.includes('Cargo.toml')) {
    commands['cargo build'] = 'Build the project';
    commands['cargo test'] = 'Run tests';
  }

  return {
    name: projectName,
    description: `Project scanned from ${targetPath}`,
    techStack,
    metadata,
    techStackInfo,
    commands,
  };
}

/**
 * Generate project.md content from scan results
 */
export async function generateProjectMarkdown(rootPath?: string): Promise<string> {
  const projectInfo = await generateProjectInfo(rootPath);
  return generateProjectTemplate(projectInfo);
}

export default {
  generateProjectInfo,
  generateProjectMarkdown,
};
