import fs from 'fs';
import path from 'path';

export interface TechStack {
  frameworks: string[];
  languages: string[];
  tools: string[];
  runtimes: string[];
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const FRAMEWORKS = {
  frontend: ['react', 'vue', 'angular', 'svelte'],
  backend: ['express', 'fastify', 'nest', 'koa', 'hapi'],
  fullstack: ['next', 'nuxt', 'remix', 'astro'],
} as const;

const RUNTIMES = ['node', 'deno', 'bun'] as const;

const TOOLS = ['eslint', 'prettier', 'vitest', 'jest', 'cypress', 'playwright'] as const;

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.py': 'Python',
  '.rs': 'Rust',
  '.go': 'Go',
  '.java': 'Java',
  '.cpp': 'C++',
  '.c': 'C',
  '.rb': 'Ruby',
  '.php': 'PHP',
};

function readPackageJson(rootPath: string): PackageJson | null {
  const packageJsonPath = path.join(rootPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content) as PackageJson;
  } catch {
    return null;
  }
}

function detectFrameworks(pkg: PackageJson): string[] {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const frameworks: string[] = [];

  for (const [framework] of Object.keys(deps)) {
    const lowerFramework = framework.toLowerCase();

    if (FRAMEWORKS.frontend.includes(lowerFramework as typeof FRAMEWORKS.frontend[number])) {
      if (!frameworks.includes(framework)) {
        frameworks.push(framework);
      }
    }

    if (FRAMEWORKS.backend.includes(lowerFramework as typeof FRAMEWORKS.backend[number])) {
      if (!frameworks.includes(framework)) {
        frameworks.push(framework);
      }
    }

    if (FRAMEWORKS.fullstack.includes(lowerFramework as typeof FRAMEWORKS.fullstack[number])) {
      if (!frameworks.includes(framework)) {
        frameworks.push(framework);
      }
    }
  }

  return frameworks;
}

function detectRuntimes(pkg: PackageJson): string[] {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const runtimes: string[] = [];

  for (const [dep] of Object.keys(deps)) {
    const lowerDep = dep.toLowerCase();

    if (RUNTIMES.includes(lowerDep as typeof RUNTIMES[number])) {
      if (!runtimes.includes(dep)) {
        runtimes.push(dep);
      }
    }
  }

  return runtimes;
}

function detectTools(pkg: PackageJson): string[] {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const tools: string[] = [];

  for (const [dep] of Object.keys(deps)) {
    const lowerDep = dep.toLowerCase();

    if (TOOLS.includes(lowerDep as typeof TOOLS[number])) {
      if (!tools.includes(dep)) {
        tools.push(dep);
      }
    }
  }

  return tools;
}

function detectLanguages(rootPath: string): string[] {
  const languages = new Set<string>();

  function scanDirectory(dirPath: string, depth: number = 0): void {
    if (depth > 5) {
      return;
    }

    let entries: string[];

    try {
      entries = fs.readdirSync(dirPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }

      const fullPath = path.join(dirPath, entry);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath, depth + 1);
        } else if (stat.isFile()) {
          const ext = path.extname(entry).toLowerCase();
          const lang = LANGUAGE_EXTENSIONS[ext];

          if (lang) {
            languages.add(lang);
          }
        }
      } catch {
        continue;
      }
    }
  }

  scanDirectory(rootPath);

  return Array.from(languages);
}

export async function detectTechStack(rootPath?: string): Promise<TechStack> {
  const targetPath = rootPath || process.cwd();

  const frameworks: string[] = [];
  const languages: string[] = [];
  const tools: string[] = [];
  const runtimes: string[] = [];

  const pkg = readPackageJson(targetPath);

  if (pkg) {
    frameworks.push(...detectFrameworks(pkg));
    runtimes.push(...detectRuntimes(pkg));
    tools.push(...detectTools(pkg));
  }

  const detectedLanguages = detectLanguages(targetPath);
  languages.push(...detectedLanguages);

  return {
    frameworks,
    languages,
    tools,
    runtimes,
  };
}
