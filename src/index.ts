#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateFeatureList, featuresToJson } from './generators/featureList.js';
import { generateProgressTemplate } from './generators/progress.js';
import { writeFile, ensureDir, copyFile } from './generators/writer.js';
import { scanProject } from './scanner/scanner.js';
import { detectTechStack } from './scanner/techStack.js';
import { generateProjectMarkdown, generateProjectInfo } from './scanner/projectGenerator.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GlobalOptions {
  force: boolean;
  outputDir: string;
  verbose: boolean;
}

const program = new Command();

program
  .name('agent-harness')
  .description(`Agent harness tool for long-running kit

A CLI tool to initialize and scan agent projects with feature tracking,
progress monitoring, and project documentation generation.`)
  .version('1.0.0')
  .option('-f, --force', 'Force overwrite existing files without prompting', false)
  .option('-o, --output-dir <directory>', 'Output directory for generated files (default: .agent-harness directory)', '.agent-harness')
  .option('-v, --verbose', 'Enable verbose debug output for troubleshooting', false);

program
  .command('init')
  .description('Initialize a new agent harness project with templates and scripts\n\nExamples:\n  agent-harness init\n  agent-harness init -n my-app -o ./output\n  agent-harness init --force')
  .option('-n, --project-name <name>', 'Name of the project', 'my-agent-project')
  .option('-d, --description <text>', 'Description of the project', 'Agent harness project')
  .action(async (options) => {
    const opts = program.opts<GlobalOptions>();
    const outputDir = path.resolve(opts.outputDir);
    const force = opts.force;
    const verbose = opts.verbose;

    try {
      if (verbose) {
        logger.info(`Initializing project in: ${outputDir}`);
      }

      // Ensure output directory exists
      await ensureDir(outputDir, { verbose });

      // Ensure script subdirectory exists
      await ensureDir(path.join(outputDir, 'script'), { verbose });
      // Generate feature_list.json
      const features = generateFeatureList();
      const featureJson = featuresToJson(features);
      const featureListPath = path.join(outputDir, 'feature_list.json');
      await writeFile(featureListPath, featureJson, { force, verbose });
      logger.success('Created feature_list.json');

      // Generate progress.md
      const progressConfig = {
        projectTitle: options.projectName,
        sessions: [],
        currentSessionId: null,
        completedFeatures: [],
        pendingFeatures: features.map((f) => f.description),
      };
      const progressContent = generateProgressTemplate(progressConfig);
      const progressPath = path.join(outputDir, 'progress.md');
      await writeFile(progressPath, progressContent, { force, verbose });
      logger.success('Created progress.md');

      // Generate init scripts
      const initShContent = `#!/bin/bash
# Initialize the agent harness project

set -e

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Running tests..."
npm test

echo "Setup complete!"
`;

      const initBatContent = `@echo off
REM Initialize the agent harness project

echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo Running tests...
call npm test

echo Setup complete!
`;

      const initPs1Content = `# PowerShell script to initialize the agent harness project

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Building project..." -ForegroundColor Cyan
npm run build

Write-Host "Running tests..." -ForegroundColor Cyan
npm test

Write-Host "Setup complete!" -ForegroundColor Green
`;

      await writeFile(path.join(outputDir, 'script', 'init.sh'), initShContent, { force, verbose });
      logger.success('Created script/init.sh');
      await writeFile(path.join(outputDir, 'script', 'init.bat'), initBatContent, { force, verbose });
      logger.success('Created script/init.bat');
      await writeFile(path.join(outputDir, 'script', 'init.ps1'), initPs1Content, { force, verbose });
      logger.success('Created script/init.ps1');
      // Scan project and generate project.md
      try {
        const scanPath = options.path || process.cwd();
        const resolvedPath = path.resolve(scanPath);

        if (verbose) {
          logger.info(`Scanning project at: ${resolvedPath}`);
        }

        // Scan project
        await scanProject(resolvedPath);

        // Detect tech stack
        await detectTechStack(resolvedPath);

        // Generate project markdown
        const projectMarkdown = await generateProjectMarkdown(resolvedPath);

        // Ensure output directory exists
        await ensureDir(outputDir, { verbose });

        // Write project.md
        const projectPath = path.join(outputDir, 'project.md');
        await writeFile(projectPath, projectMarkdown, { force, verbose });
        logger.success('Created project.md');
      } catch (scanError) {
        const message = scanError instanceof Error ? scanError.message : 'Unknown error';
        logger.warn(`Failed to scan project: ${message}`);
      }

      logger.success('Project initialization complete!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to initialize project: ${message}`, true);
    }
  });

program
  .command('scan')
  .description('Scan an existing project and generate project.md documentation\n\nExamples:\n  agent-harness scan\n  agent-harness scan -p /path/to/project\n  agent-harness scan -v\n  agent-harness scan -o ./docs')
  .option('-p, --path <directory>', 'Directory to scan (default: current working directory)', process.cwd())
  .action(async (options) => {
    const opts = program.opts<GlobalOptions>();
    const outputDir = path.resolve(opts.outputDir);
    const force = opts.force;
    const verbose = opts.verbose;

    try {
      const scanPath = options.path || process.cwd();
      const resolvedPath = path.resolve(scanPath);

      if (verbose) {
        logger.info(`Scanning project at: ${resolvedPath}`);
      }

      // Scan project
      const metadata = await scanProject(resolvedPath);
      if (verbose) {
        logger.info(`Found ${metadata.rootFiles.length} root files`);
        logger.info(`Found ${metadata.sourceDirs.length} source directories`);
        logger.info(`Project type: ${metadata.projectType}`);
      }

      // Detect tech stack
      const techStack = await detectTechStack(resolvedPath);
      if (verbose) {
        logger.info(`Detected languages: ${techStack.languages.join(', ')}`);
        logger.info(`Detected frameworks: ${techStack.frameworks.join(', ')}`);
        logger.info(`Detected tools: ${techStack.tools.join(', ')}`);
      }

      // Generate project markdown
      const projectMarkdown = await generateProjectMarkdown(resolvedPath);

      // Ensure output directory exists
      await ensureDir(outputDir, { verbose });

      // Write project.md
      const projectPath = path.join(outputDir, 'project.md');
      await writeFile(projectPath, projectMarkdown, { force, verbose });
      logger.success(`Created project.md at ${projectPath}`);

      // Also output to console if verbose
      if (verbose) {
        console.log('\n--- Generated project.md ---\n');
        console.log(projectMarkdown);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to scan project: ${message}`, true);
    }
  });

export { program };

program.parse();
