/**
 * Progress generator for agent-harness tool.
 * Generates markdown progress reports for tracking session history and features.
 */

/**
 * Represents a single session entry in the progress history.
 */
export interface ProgressEntry {
  /** Unique identifier for the session */
  id: string;
  /** Brief description of what was accomplished */
  description: string;
  /** Current status of the session */
  status: 'in_progress' | 'completed' | 'pending';
  /** Placeholder for session date (use dynamic date in template) */
  date: string;
}

/**
 * Configuration for generating the progress template.
 */
export interface ProgressConfig {
  /** Title of the project */
  projectTitle: string;
  /** List of session history entries */
  sessions: ProgressEntry[];
  /** Current active session ID */
  currentSessionId: string | null;
  /** List of completed feature names */
  completedFeatures: string[];
  /** List of pending feature names */
  pendingFeatures: string[];
}

/**
 * Generates a markdown progress report template.
 * @param config - Configuration for the progress report
 * @returns Formatted markdown string
 */
export function generateProgressTemplate(config: ProgressConfig): string {
  const { projectTitle, sessions, currentSessionId, completedFeatures, pendingFeatures } = config;

  // Build session history section
  const sessionHistoryLines: string[] = [];
  for (const session of sessions) {
    const statusIcon = session.status === 'completed' ? '✓' : session.status === 'in_progress' ? '●' : '○';
    const isActive = session.id === currentSessionId ? ' (current)' : '';
    sessionHistoryLines.push(`- ${statusIcon} ${session.date}: ${session.description}${isActive}`);
  }

  // Build current status section
  let currentStatusContent = 'No active session.';
  if (currentSessionId) {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      currentStatusContent = `**Session**: ${currentSession.description}\n**Status**: ${currentSession.status.replace('_', ' ')}\n**Date**: ${currentSession.date}`;
    }
  }

  // Build completed features section
  const completedFeaturesLines = completedFeatures.length > 0
    ? completedFeatures.map(f => `- ${f}`)
    : ['_No completed features yet_'];

  // Build pending features section
  const pendingFeaturesLines = pendingFeatures.length > 0
    ? pendingFeatures.map(f => `- ${f}`)
    : ['_No pending features_'];

  // Combine all sections
  const template = `# Progress

## Session History

${sessionHistoryLines.length > 0 ? sessionHistoryLines.join('\n') : '_No session history yet_'}

## Current Status

${currentStatusContent}

## Completed Features

${completedFeaturesLines.join('\n')}

## Pending Features

${pendingFeaturesLines.join('\n')}
`;

  return template;
}

export { generateProgressTemplate as default };
