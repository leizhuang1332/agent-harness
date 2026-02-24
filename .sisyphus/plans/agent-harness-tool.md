# Long-Running Agent Harness Tool (AgentHarness CLI)

## TL;DR

> **Quick Summary**: A cross-platform CLI tool that generates constraint files for long-running AI agents, inspired by Anthropic's "Effective Harnesses for Long-Running Agents" and OpenSpec. Supports both greenfield (new projects) and brownfield (existing projects) scenarios.
> 
> **Deliverables**:
> - `agent-harness` CLI tool (npm global package)
> - Cross-platform init scripts (init.sh, init.bat, init.ps1)
> - feature_list.json template
> - progress.md template
> - project.md generator with tech stack detection
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Project setup → Core CLI → File generators → Brownfield scanner

---

## Context

### Original Request
Create a specification-driven development tool based on Anthropic's "Effective Harnesses for Long-Running Agents" that can quickly generate constraint files for projects, similar to OpenSpec. Must be cross-platform (macOS, Windows, Linux) and work for both new and existing projects.

### Interview Summary
**Key Discussions**:
- **Project Type**: New standalone CLI tool
- **Feature Set**: Full - all 4 files (feature_list.json, progress.md, init scripts, project.md)
- **Brownfield Scanning**: Full scan with auto-detection of tech stack
- **Platform**: TypeScript/Node.js with commander.js

### Research Findings
- **CLI Framework**: commander.js (500M+ weekly downloads) - lighter than oclif
- **Cross-platform**: cross-spawn for subprocess, path.join() for paths
- **Templates**: Handlebars for file generation
- **Pattern**: process.platform detection for OS-specific behavior
- **Distribution**: npm global package with bin entry points

### Metis Review
**Identified Gaps** (addressed in this plan):
1. **File schemas**: Defined exact JSON structure for feature_list.json based on Anthropic article
2. **Init script behavior**: Run dev server + basic e2e test pattern
3. **Brownfield detection**: Package.json/tsconfig.json detection + file extension analysis

---

## Work Objectives

### Core Objective
Build a CLI tool `agent-harness` that generates constraint files for AI coding agents working on long-running projects.

### Concrete Deliverables
- Cross-platform CLI executable (`agent-harness init`, `agent-harness scan`)
- feature_list.json with structured feature entries
- progress.md with session tracking template
- project.md with auto-generated architecture documentation
- init.sh / init.bat / init.ps1 for environment setup

### Definition of Done
- [ ] `agent-harness --version` returns version info
- [ ] `agent-harness init` creates all 4 constraint files in new directory
- [ ] `agent-harness scan` analyzes existing project and generates project.md
- [ ] Init scripts work on macOS, Windows, Linux
- [ ] CLI handles errors gracefully with helpful messages

### Must Have
- Cross-platform compatibility (Windows, macOS, Linux)
- TypeScript implementation with type safety
- Comprehensive error handling
- Clear CLI help output
- npm distribution ready

### Must NOT Have (Guardrails)
- No external API calls (fully offline)
- No secret/sensitive data handling
- No database dependencies
- No AI model integration (pure tool, not agent)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (this IS the project)
- **Automated tests**: Tests after implementation
- **Framework**: vitest (already configured in existing project structure reference)

### QA Policy
Every task includes agent-executed QA scenarios. All verification is agent-executed.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── Task 1: Initialize TypeScript CLI project structure
├── Task 2: Set up package.json with dependencies
├── Task 3: Create CLI entry point with commander.js
├── Task 4: Implement cross-platform utilities (path, OS detection)
└── Task 5: Add logging and error handling

Wave 2 (After Wave 1 — core generators, MAX PARALLEL):
├── Task 6: Implement feature_list.json generator (greenfield)
├── Task 7: Implement progress.md generator (greenfield)
├── Task 8: Implement project.md generator (greenfield)
├── Task 9: Create init.sh template (Unix)
├── Task 10: Create init.bat template (Windows)
├── Task 11: Create init.ps1 template (Windows PowerShell)
└── Task 12: Implement file writer with templates

Wave 3 (After Wave 2 — brownfield + integration):
├── Task 13: Implement brownfield project scanner
├── Task 14: Add tech stack detection (package.json, tsconfig, etc.)
├── Task 15: Generate project.md from scan results
├── Task 16: Integrate all commands into main CLI
├── Task 17: Add comprehensive CLI help
└── Task 18: Test cross-platform compatibility
```

---

## TODOs

- [ ] 1. Initialize TypeScript CLI project structure

  **What to do**:
  - Create project directory structure: src/, bin/, templates/
  - Set up tsconfig.json with appropriate compiler options
  - Create initial package.json with name "agent-harness"
  - Set up vitest.config.ts for testing

  **Must NOT do**:
  - Do not include unnecessary dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple project setup, follows standard patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 2-5
  - **Blocked By**: None

  **References**:
  - Standard TypeScript project structure from AGENTS.md

  **Acceptance Criteria**:
  - [ ] Directory structure created
  - [ ] tsconfig.json valid

- [ ] 2. Set up package.json with dependencies

  **What to do**:
  - Add commander as dependency
  - Add cross-spawn as dependency
  - Add chalk/ora for output formatting
  - Add types for dependencies
  - Configure bin entry point

  **Must NOT do**:
  - Do not add runtime dependencies beyond CLI needs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Configuration task

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 3-5
  - **Blocked By**: Task 1

  **Acceptance Criteria**:
  - [ ] package.json with all dependencies
  - [ ] npm install succeeds

- [ ] 3. Create CLI entry point with commander.js

  **What to do**:
  - Create src/index.ts as main entry
  - Set up commander with subcommands
  - Implement --version flag
  - Implement --help output
  - Create init and scan commands

  **Must NOT do**:
  - Do not implement command logic yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Standard CLI patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1, 2)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 6-18
  - **Blocked By**: Tasks 1, 2

  **References**:
  - commander.js documentation pattern

  **Acceptance Criteria**:
  - [ ] `npx agent-harness --version` works
  - [ ] `npx agent-harness --help` shows commands

- [ ] 4. Implement cross-platform utilities

  **What to do**:
  - Create src/utils/platform.ts for OS detection
  - Implement isWindows, isMacOS, isLinux functions
  - Create src/utils/path.ts for cross-platform paths
  - Implement getProjectRoot(), resolvePath() helpers

  **Must NOT do**:
  - Do not use hardcoded path separators

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple utility functions

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Wave 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 6-18
  - **Blocked By**: Task 1

  **References**:
  - Cross-platform patterns from research

  **Acceptance Criteria**:
  - [ ] OS detection returns correct platform
  - [ ] Path utilities work on Windows/Unix

- [ ] 5. Add logging and error handling

  **What to do**:
  - Create src/utils/logger.ts with chalk formatting
  - Implement info, success, error, warn loggers
  - Add try-catch wrapper for commands
  - Implement graceful error exit

  **Must NOT do**:
  - Do not log sensitive data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple utility task

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Wave 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 6-18
  - **Blocked By**: Task 1

  **Acceptance Criteria**:
  - [ ] Colored output works
  - [ ] Errors show helpful messages

- [ ] 6. Implement feature_list.json generator

  **What to do**:
  - Create src/generators/featureList.ts
  - Define Feature interface (category, description, steps, passes)
  - Create default feature list based on Anthropic article pattern
  - Implement JSON serialization with proper formatting

  **Must NOT do**:
  - Do not add features beyond basic project setup

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Core generator logic with template

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 7-11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - Anthropic article feature_list.json structure

  **Acceptance Criteria**:
  - [ ] Generates valid JSON
  - [ ] All features have passes: false

- [ ] 7. Implement progress.md generator

  **What to do**:
  - Create src/generators/progress.ts
  - Define ProgressEntry interface
  - Create markdown template with sections:
    - Session history
    - Current status
    - Completed features
    - Pending features
  - Implement template rendering

  **Must NOT do**:
  - Do not include sensitive data in template

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Template generation logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 8-11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **Acceptance Criteria**:
  - [ ] Generates valid markdown
  - [ ] Contains all required sections

- [ ] 8. Implement project.md generator

  **What to do**:
  - Create src/generators/project.ts
  - Define ProjectInfo interface
  - Create markdown template with sections:
    - Project overview
    - Tech stack
    - Architecture
    - Commands
    - Constraints
  - Implement template rendering

  **Must NOT do**:
  - Do not make assumptions about project type

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Template generation logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 9-11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **Acceptance Criteria**:
  - [ ] Generates valid markdown
  - [ ] Template structure is clear

- [ ] 9. Create init.sh template (Unix)

  **What to do**:
  - Create templates/init.sh
  - Include:
    - Development server startup
    - Basic e2e test execution
    - Port checking
    - Error handling
  - Use #!/bin/bash shebang

  **Must NOT do**:
  - Do not use Windows-specific commands

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple template file

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-8, 10-11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - Anthropic article init.sh pattern

  **Acceptance Criteria**:
  - [ ] Valid bash script syntax
  - [ ] Works on macOS and Linux

- [ ] 10. Create init.bat template (Windows)

  **What to do**:
  - Create templates/init.bat
  - Include same functionality as init.sh
  - Use Windows commands (npm run dev, etc.)
  - Handle error levels properly

  **Must NOT do**:
  - Do not use Unix commands

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple template file

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-9, 11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **Acceptance Criteria**:
  - [ ] Valid batch file syntax
  - [ ] Works on Windows cmd

- [ ] 11. Create init.ps1 template (Windows PowerShell)

  **What to do**:
  - Create templates/init.ps1
  - Include same functionality as init.sh
  - Use PowerShell best practices
  - Proper error handling with $ErrorActionPreference

  **Must NOT do**:
  - Do not use Unix-specific commands

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple template file

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-10)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 3, 4, 5

  **Acceptance Criteria**:
  - [ ] Valid PowerShell script syntax
  - [ ] Works on Windows PowerShell 5.1+

- [ ] 12. Implement file writer with templates

  **What to do**:
  - Create src/generators/writer.ts
  - Implement writeFile function with path handling
  - Add template variable replacement
  - Implement directory creation
  - Add file overwrite confirmation

  **Must NOT do**:
  - Do not overwrite existing files without warning

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Core file I/O logic

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 6-11)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 13-18
  - **Blocked By**: Tasks 6-11

  **References**:
  - Node.js fs module patterns

  **Acceptance Criteria**:
  - [ ] Creates files in correct locations
  - [ ] Handles path correctly on all platforms

- [ ] 13. Implement brownfield project scanner

  **What to do**:
  - Create src/scanner/scanner.ts
  - Implement scanProject() function
  - Detect project structure:
    - Root files (package.json, tsconfig.json, etc.)
    - Source directories (src/, lib/, app/)
    - Config files (.eslintrc, .prettierrc, etc.)
  - Build project metadata

  **Must NOT do**:
  - Do not scan outside project root

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: File system analysis logic

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Wave 1-2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 14-15
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] Scans current directory
  - [ ] Returns project metadata

- [ ] 14. Add tech stack detection

  **What to do**:
  - Create src/scanner/techStack.ts
  - Detect frameworks from package.json dependencies:
    - React, Vue, Angular, Svelte
    - Express, Fastify, NestJS
    - Next.js, Nuxt, Remix
    - Node.js, Deno, Bun
  - Detect languages: TypeScript, JavaScript, Python
  - Detect tools: ESLint, Prettier, Vitest, Jest

  **Must NOT do**:
  - Do not assume specific versions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Pattern matching logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13, 15-17)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 18
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] Detects common frameworks
  - [ ] Returns list of detected technologies

- [ ] 15. Generate project.md from scan results

  **What to do**:
  - Integrate scanner with project.md generator
  - Populate template with detected info
  - Add manual override options
  - Generate comprehensive architecture section

  **Must NOT do**:
  - Do not generate incorrect information

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Integration task

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13-14, 16-17)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 18
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] project.md reflects scanned data
  - [ ] Tech stack section populated

- [ ] 16. Integrate all commands into main CLI

  **What to do**:
  - Wire up init command to generators
  - Wire up scan command to scanner
  - Add command options (--force, --output-dir, etc.)
  - Add interactive prompts for missing info

  **Must NOT do**:
  - Do not break existing command structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Integration task

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13-15, 17-18)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] All commands work end-to-end
  - [ ] CLI responds to user input

- [ ] 17. Add comprehensive CLI help

  **What to do**:
  - Add detailed help text for each command
  - Include examples for common use cases
  - Add --verbose flag for debug output
  - Document all options

  **Must NOT do**:
  - Do not include outdated information

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Documentation task

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13-16, 18)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 12

  **Acceptance Criteria**:
  - [ ] Help text is clear and complete
  - [ ] Examples are accurate

- [ ] 18. Test cross-platform compatibility

  **What to do**:
  - Test on Windows (cmd and PowerShell)
  - Test on macOS
  - Test on Linux
  - Verify init scripts work on each platform

  **Must NOT do**:
  - Do not assume platform-specific behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Platform testing

  **Parallelization**:
  - **Can Run In Parallel**: NO (final integration)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final verification
  - **Blocked By**: Tasks 13-17

  **Acceptance Criteria**:
  - [ ] Works on Windows
  - [ ] Works on macOS
  - [ ] Works on Linux

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify all tasks have clear implementation steps.
  Output: `Must Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + lint. Review for type safety and error handling.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Execute all CLI commands:
  - `agent-harness init` in new directory
  - `agent-harness scan` in existing project
  Verify output files are correct.
  Output: `Commands [N/N] | Files [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify everything in plan was implemented.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat: set up CLI project structure` - package.json, tsconfig, core files
- **Wave 2**: `feat: add file generators` - feature_list, progress, project generators + init scripts
- **Wave 3**: `feat: add brownfield scanner` - scanner, tech detection, integration
- **Final**: `chore: final testing and cleanup`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Compiles TypeScript
npm test      # Runs tests
agent-harness --version  # Shows version
agent-harness init        # Creates constraint files
agent-harness scan        # Scans existing project
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] CLI works on Windows, macOS, Linux
- [ ] All files generate correctly
