import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssistantSkillsPath, installToOpenCode, installToQwenCode, installToCursor } from './installSkills';
import * as fs from 'fs';

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
  const originalCwd = process.cwd;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return project-level path for opencode', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    const result = getAssistantSkillsPath('opencode');
    
    expect(result).toBe('D:\\test\\project\\.opencode\\skills');
    
    process.cwd = originalCwd;
  });

  it('should return project-level path for cursor', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    const result = getAssistantSkillsPath('cursor');
    
    expect(result).toBe('D:\\test\\project\\.cursor\\skills');
    
    process.cwd = originalCwd;
  });

  it('should return project-level path for qwen-code', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    const result = getAssistantSkillsPath('qwen-code');
    
    expect(result).toBe('D:\\test\\project\\.qwen\\skills');
    
    process.cwd = originalCwd;
  });

  it('should return null for unknown assistant', () => {
    const result = getAssistantSkillsPath('unknown-assistant');
    expect(result).toBeNull();
  });
    });

describe('installToOpenCode', () => {
  const originalCwd = process.cwd;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install skills to project-level .opencode/skills directory', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        if (filePath === 'D:\\test\\project\\skills') return true;
        if (filePath.includes('.opencode\\skills')) return false;
      }
      return false;
    });
    
    vi.mocked(fs.readdirSync).mockReturnValue(['app-spec', 'plan2features'] as any);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    
    const result = installToOpenCode();
    
    expect(result.success).toBe(true);
    expect(result.path).toBe('D:\\test\\project\\.opencode\\skills');
    
    process.cwd = originalCwd;
  });
    });

describe('installToQwenCode', () => {
  const originalCwd = process.cwd;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install skills to project-level .qwen/skills directory', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        if (filePath === 'D:\\test\\project\\skills') return true;
        if (filePath.includes('.qwen\\skills')) return false;
      }
      return false;
    });
    
    vi.mocked(fs.readdirSync).mockReturnValue(['app-spec', 'plan2features'] as any);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    
    const result = installToQwenCode();
    
    expect(result.success).toBe(true);
    expect(result.path).toBe('D:\\test\\project\\.qwen\\skills');
    
    process.cwd = originalCwd;
  });
});

describe('installToCursor', () => {
  const originalCwd = process.cwd;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install skills to project-level .cursor/skills directory', () => {
    process.cwd = vi.fn().mockReturnValue('D:\\test\\project');
    
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      if (typeof filePath === 'string') {
        if (filePath === 'D:\\test\\project\\skills') return true;
        if (filePath.includes('.cursor\\skills')) return false;
      }
      return false;
    });
    
    vi.mocked(fs.readdirSync).mockReturnValue(['app-spec', 'plan2features'] as any);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);
    
    const result = installToCursor();
    
    expect(result.success).toBe(true);
    expect(result.path).toBe('D:\\test\\project\\.cursor\\skills');
    
    process.cwd = originalCwd;
  });
});
