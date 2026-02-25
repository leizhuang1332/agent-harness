import fs from 'fs';
import path from 'path';

export interface ProjectMetadata {
  rootFiles: string[];
  sourceDirs: string[];
  configFiles: string[];
  projectType: string;
}

const ROOT_FILES = [
  'package.json',
  'tsconfig.json',
  'jsconfig.json',
  'pyproject.toml',
  'setup.py',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'composer.json',
  'Gemfile',
  'Makefile',
  '.env',
  '.env.local',
  '.env.example',
];

const SOURCE_DIRS = ['src', 'lib', 'app', 'source', 'packages', 'modules'];

const CONFIG_FILES = [
  '.eslintrc',
  '.eslintrc.json',
  '.eslintrc.js',
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.js',
  'vitest.config.ts',
  'vitest.config.js',
  'jest.config.js',
  'jest.config.ts',
  '.mocharc.json',
  '.mocharc.js',
  'tslint.json',
  '.npmrc',
  '.npmignore',
  '.gitignore',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
];

const PROJECT_TYPE_MAP: Record<string, string> = {
  'package.json': 'npm',
  'pyproject.toml': 'pip',
  'setup.py': 'pip',
  'requirements.txt': 'pip',
  'Cargo.toml': 'cargo',
  'go.mod': 'go',
  'pom.xml': 'maven',
  'build.gradle': 'gradle',
  'composer.json': 'composer',
  'Gemfile': 'ruby',
};

function detectProjectType(rootFiles: string[]): string {
  for (const [file, type] of Object.entries(PROJECT_TYPE_MAP)) {
    if (rootFiles.includes(file)) {
      return type;
    }
  }
  return 'unknown';
}

export async function scanProject(rootPath: string = process.cwd()): Promise<ProjectMetadata> {
  const rootFiles: string[] = [];
  const sourceDirs: string[] = [];
  const configFiles: string[] = [];

  const entries = await fs.promises.readdir(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const name = entry.name;

    // Skip node_modules and .git
    if (name === 'node_modules' || name === '.git') {
      continue;
    }

    if (entry.isFile()) {
      if (ROOT_FILES.includes(name)) {
        rootFiles.push(name);
      } else if (CONFIG_FILES.includes(name)) {
        configFiles.push(name);
      }
    } else if (entry.isDirectory()) {
      if (SOURCE_DIRS.includes(name)) {
        sourceDirs.push(name);
      }
    }
  }

  const projectType = detectProjectType(rootFiles);

  return {
    rootFiles: rootFiles.sort(),
    sourceDirs: sourceDirs.sort(),
    configFiles: configFiles.sort(),
    projectType,
  };
}
