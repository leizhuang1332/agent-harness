import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs';
import {
  checkAgentsMdExists,
  copyAgentsMdTemplate,
  FileOperationError
} from '../utils/fileUtils.js';
import { getInstalledAssistants, type AIAssistant } from '../utils/detectAssistants.js';
import { installSkills, SkillInstallationError } from '../utils/installSkills.js';

/**
 * Setup command - Configures agent harness for the current project
 * Uses interactive prompts to guide user through setup process
 */
export function createSetupCommand(): Command {
  const setupCommand = new Command('setup');

  setupCommand
    .description('Configure agent harness for the current project')
    .helpOption('-h, --help', 'Display help for setup command');

  setupCommand.action(async () => {
    try {
      // Step 1: Ask user which files to create
      const fileAnswers = await (inquirer.prompt as any)([
        {
          type: 'checkbox',
          name: 'files',
          message: 'Which files do you want to create?',
          choices: [
            {
              name: 'AGENTS.md',
              checked: true
            }
          ],
          validate: (answer: string[]) => {
            if (answer.length === 0) {
              return 'You must select at least one file.';
            }
            return true;
          }
        }
      ]);

      const selectedFiles = (fileAnswers as any).files as string[];

      // Step 2: Ask user which AI assistants to install skills to
      const installedAssistants = getInstalledAssistants();
      const availableAssistants = installedAssistants
        .filter((assistant: AIAssistant) => assistant.installed)
        .map((assistant: AIAssistant) => ({
          name: assistant.name
        }));

      let selectedAssistants: string = '';

      if (availableAssistants.length > 0) {
        const assistantAnswers = await (inquirer.prompt as any)([
          {
            type: 'list',
            name: 'assistants',
            message: 'Which AI assistants do you want to install skills to?',
            choices: availableAssistants
          }
        ]);
        selectedAssistants = (assistantAnswers as any).assistants as string;
      } else {
        console.log('\nNo supported AI assistants found on this system.');
        console.log('Supported: OpenCode, Qwen Code');
      }

      // Step 3: Check for existing files and ask about overwrite
      const existingFiles: string[] = [];
      if (selectedFiles.includes('AGENTS.md') && checkAgentsMdExists()) {
        existingFiles.push('AGENTS.md');
      }

      let shouldOverwrite = false;
      if (existingFiles.length > 0) {
        const overwriteAnswer = await (inquirer.prompt as any)([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `The following files already exist: ${existingFiles.join(', ')}. Do you want to overwrite them?`,
            default: false
          }
        ]);
        shouldOverwrite = (overwriteAnswer as any).overwrite as boolean;
      }

      // Step 4: Create the files
      console.log('\n--- Setup Summary ---');
      console.log(`Files to create: ${selectedFiles.join(', ')}`);
      console.log(`AI Assistants: ${selectedAssistants || 'None'}`);
      console.log(`Overwrite existing: ${shouldOverwrite ? 'Yes' : 'No'}`);
      console.log('--------------------\n');

      // Create files based on selection with progress feedback
      const fileSpinner = ora('Creating files...').start();
      
      try {
        for (const file of selectedFiles) {
          if (file === 'AGENTS.md') {
            if (shouldOverwrite || !checkAgentsMdExists()) {
              const success = copyAgentsMdTemplate();
              if (success) {
                fileSpinner.text = 'Created AGENTS.md';
              } else if (!shouldOverwrite) {
                fileSpinner.text = 'AGENTS.md already exists (skipped)';
              }
            } else {
              fileSpinner.text = 'AGENTS.md already exists (skipped)';
            }
          }
        }
        fileSpinner.succeed('Files created successfully');
      } catch (fileError) {
        fileSpinner.fail('Failed to create files');
        throw fileError;
      }

      // Step 5: Install skills to AI assistants
      if (selectedAssistants) {
        const skillsSpinner = ora('Installing skills to AI assistants...').start();
        
        try {
          // Map assistant names to installSkills target names
          const targetMap: Record<string, string> = {
            'OpenCode': 'opencode',
            'Qwen Code': 'qwen-code'
          };
          
          const targets = [targetMap[selectedAssistants]].filter(Boolean) as string[];
          
          const results = await installSkills(targets);
          
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;
          
          if (failCount === 0) {
            skillsSpinner.succeed(`Installed skills to ${successCount} AI assistant(s)`);
            for (const result of results) {
              if (result.success && result.path) {
                console.log(`  → ${result.message} (${result.path})`);
              }
            }
          } else {
            skillsSpinner.warn(`Installed to ${successCount}, failed for ${failCount} AI assistant(s)`);
            for (const result of results) {
              if (result.success) {
                console.log(`  ✓ ${result.message}`);
              } else {
                console.log(`  ✗ ${result.message}`);
              }
            }
          }
        } catch (skillsError) {
          skillsSpinner.fail('Failed to install skills');
          throw skillsError;
        }
      }

      console.log('\n✓ Setup complete!');

    } catch (error) {
      // Handle custom error types with friendly messages
      if (error instanceof FileOperationError) {
        console.error('\n❌ File Operation Error:');
        console.error(`   ${error.message}`);
      } else if (error instanceof SkillInstallationError) {
        console.error('\n❌ Skill Installation Error:');
        console.error(`   ${error.message}`);
      } else if ((error as any).isTtyError) {
        console.error('\n❌ Error: Prompt could not be rendered in this environment.');
      } else if ((error as any).message === 'User force cancelled prompt') {
        console.log('\n⚠️ Setup cancelled by user.');
      } else {
        // Generic error - show friendly message without exposing system details
        console.error(error)
        console.error('\n❌ An unexpected error occurred during setup.');
        console.error('   Please try again. If the problem persists, please report the issue.');
      }
      process.exit(1);
    }
  });

  return setupCommand;
}
