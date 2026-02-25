/**
 * Feature list generator for agent-harness tool.
 * Generates feature definitions for project validation based on Anthropic article patterns.
 */

export interface Feature {
  /** Feature category (e.g., 'setup', 'testing', 'documentation') */
  category: string;
  /** Human-readable description of the feature */
  description: string;
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
    category: 'setup',
    description: 'Project has valid package.json',
    steps: ['Check package.json exists', 'Validate JSON syntax', 'Verify required fields'],
    passes: false,
  },
  {
    category: 'setup',
    description: 'Project has TypeScript configuration',
    steps: ['Check tsconfig.json exists', 'Validate TypeScript configuration'],
    passes: false,
  },
  {
    category: 'setup',
    description: 'Project has git repository initialized',
    steps: ['Check .git directory exists', 'Verify git is initialized'],
    passes: false,
  },
  {
    category: 'setup',
    description: 'Dependencies are installed',
    steps: ['Check node_modules directory exists', 'Verify package-lock.json or yarn.lock'],
    passes: false,
  },
  {
    category: 'setup',
    description: 'Project has entry point',
    steps: ['Check main entry file exists', 'Verify exports are valid'],
    passes: false,
  },
  {
    category: 'build',
    description: 'Project builds successfully',
    steps: ['Run build command', 'Check for compilation errors', 'Verify output directory'],
    passes: false,
  },
  {
    category: 'linting',
    description: 'Code passes linting',
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
