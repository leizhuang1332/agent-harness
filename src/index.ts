#!/usr/bin/env node

import { Command } from 'commander';
import { createSetupCommand } from './commands/setup.js';

const program = new Command();

program
  .name('agent-harness')
  .description('Agent harness tool for long-running AI agents')
  .version('1.0.0');

// Register commands
program.addCommand(createSetupCommand());

// Parse arguments
program.parse(process.argv);
