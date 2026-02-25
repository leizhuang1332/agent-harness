/**
 * Project Markdown Generator
 * Generates project.md for agent-harness tool
 */

export interface ProjectInfo {
  name: string;
  description: string;
  techStack: string[];
  architecture?: string;
  commands: Record<string, string>;
  constraints?: string[];
}

/**
 * Generate project.md markdown content from ProjectInfo
 */
export function generateProjectTemplate(info: ProjectInfo): string {
  const techStackSection = info.techStack.length > 0
    ? `## Tech Stack\n\n${info.techStack.map((tech) => `- ${tech}`).join('\n')}\n`
    : '';

  const architectureSection = info.architecture
    ? `## Architecture\n\n${info.architecture}\n`
    : '';

  const commandsSection = Object.keys(info.commands).length > 0
    ? `## Commands\n\n| Command | Description |\n|---------|-------------|\n${Object.entries(info.commands).map(([cmd, desc]) => `| \`${cmd}\` | ${desc} |`).join('\n')}\n`
    : '';

  const constraintsSection = info.constraints && info.constraints.length > 0
    ? `## Constraints\n\n${info.constraints.map((c) => `- ${c}`).join('\n')}\n`
    : '';

  return `# Project: ${info.name}

${info.description}

${techStackSection}${architectureSection}${commandsSection}${constraintsSection}`.trim();
}
