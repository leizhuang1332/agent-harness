import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssistantSkillsPath, installToOpenCode, installToQwenCode } from './installSkills';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module with all required methods
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  rmSync: vi.fn(),
  statSync: vi.fn(),
}));

describe('getAssistantSkillsPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return project-level path for opencode', () => {
    // On all platforms, path.join normalizes to forward slashes
    const result = getAssistantSkillsPath('opencode');
    
    expect(result).toContain('.opencode/skills');
  });

  it('should return project-level path for qwen-code', () => {
    const result = getAssistantSkillsPath('qwen-code');
    
    expect(result).toContain('.qwen/skills');
  });

  it('should return null for unknown assistant', () => {
    const result = getAssistantSkillsPath('unknown-assistant');
    expect(result).toBeNull();
  });
});

describe('installToOpenCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install skills to project-level .opencode/skills directory', () => {
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        // Check for skills source directory
        if (filePath.endsWith('/skills')) return true;
        // Target directory doesn't exist yet
        if (filePath.includes('.opencode')) return false;
      }
      return false;
    });
    
    vi.mocked(fs.readdirSync).mockReturnValue(['app-spec', 'plan2features'] as any);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.copyFileSync).mockImplementation(() => undefined);
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);
    
    const result = installToOpenCode();
    
    expect(result.success).toBe(true);
    expect(result.path).toContain('.opencode/skills');
  });
});

describe('installToQwenCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install skills to project-level .qwen/skills directory', () => {
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        // Check for skills source directory
        if (filePath.endsWith('/skills')) return true;
        // Target directory doesn't exist yet
        if (filePath.includes('.qwen')) return false;
      }
      return false;
    });
    
    vi.mocked(fs.readdirSync).mockReturnValue(['app-spec', 'plan2features'] as any);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.copyFileSync).mockImplementation(() => undefined);
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);
    
    const result = installToQwenCode();
    
    expect(result.success).toBe(true);
    expect(result.path).toContain('.qwen/skills');
  });
});
