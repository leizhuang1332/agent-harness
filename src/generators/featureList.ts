/**
 * Feature list generator for agent-harness tool.
 * Generates feature definitions for project validation based on Anthropic article patterns.
 */

export interface Feature {
  /** Feature ID (unique identifier, starts from 1) */
  id: number;
  /** Feature category (e.g., 'setup', 'testing', 'documentation') */
  category: string;
  /** Human-readable description of the feature */
  description: string;
  /** Source document this feature was generated from */
  source: string;
  /** Task priority (p0 is highest, p5 is lowest) */
  priority: 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5';
  /** Steps required to validate this feature */
  steps: string[];
  /** Whether the feature validation passes */
  passes: boolean;
}

/**
 * Default feature list for basic project setup.
 * Based on Anthropic article pattern for agent evaluation.
 */
const defaultFeatures: Feature[] = [
  {
    id: 1,
    category: 'setup',
    description: 'Project has valid package.json',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p0',
    steps: ['Check package.json exists', 'Validate JSON syntax', 'Verify required fields'],
    passes: false,
  },
  {
    id: 2,
    category: 'setup',
    description: 'Project has TypeScript configuration',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p0',
    steps: ['Check tsconfig.json exists', 'Validate TypeScript configuration'],
    passes: false,
  },
  {
    id: 3,
    category: 'setup',
    description: 'Project has git repository initialized',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p0',
    steps: ['Check .git directory exists', 'Verify git is initialized'],
    passes: false,
  },
  {
    id: 4,
    category: 'setup',
    description: 'Dependencies are installed',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p0',
    steps: ['Check node_modules directory exists', 'Verify package-lock.json or yarn.lock'],
    passes: false,
  },
  {
    id: 5,
    category: 'setup',
    description: 'Project has entry point',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p0',
    steps: ['Check main entry file exists', 'Verify exports are valid'],
    passes: false,
  },
  {
    id: 6,
    category: 'build',
    description: 'Project builds successfully',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p1',
    steps: ['Run build command', 'Check for compilation errors', 'Verify output directory'],
    passes: false,
  },
  {
    id: 7,
    category: 'linting',
    description: 'Code passes linting',
    source: 'docs/orchestrator-design-phases.md',
    priority: 'p2',
    steps: ['Run linter', 'Check for linting errors', 'Verify code style'],
    passes: false,
  },
];

/**
 * Generate the feature list.
 * @returns Array of Feature objects
 */
export function generateFeatureList(): Feature[] {
  return [...defaultFeatures];
}

/**
 * Convert feature list to JSON string.
 * @param features Array of Feature objects
 * @param pretty Whether to pretty-print the JSON
 * @returns JSON string representation
 */
export function featuresToJson(features: Feature[], pretty = true): string {
  if (pretty) {
    return JSON.stringify(features, null, 2);
  }
  return JSON.stringify(features);
}

/**
 * Get a feature by category.
 * @param features Array of Feature objects
 * @param category Category to filter by
 * @returns Filtered array of features
 */
export function getFeaturesByCategory(features: Feature[], category: string): Feature[] {
  return features.filter((f) => f.category === category);
}

/**
 * Update the passes status for a specific feature.
 * @param features Array of Feature objects
 * @param description Feature description to match
 * @param passes New passes status
 * @returns Updated feature list
 */
export function updateFeatureStatus(
  features: Feature[],
  description: string,
  passes: boolean
): Feature[] {
  return features.map((f) =>
    f.description === description ? { ...f, passes } : f
  );
}

export default {
  generateFeatureList,
  featuresToJson,
  getFeaturesByCategory,
  updateFeatureStatus,
};
