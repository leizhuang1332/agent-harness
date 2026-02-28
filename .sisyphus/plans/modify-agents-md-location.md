# 修改 AGENTS.md 生成位置 - 执行计划

## 任务概述

将 setup 命令中创建 AGENTS.md 的逻辑从当前项目路径 (`process.cwd()/AGENTS.md`) 改为 `.agent-harness/` 目录下 (`process.cwd()/.agent-harness/AGENTS.md`)。

---

## 代码分析

### 涉及文件

| 文件 | 作用 |
|------|------|
| `src/utils/fileUtils.ts` | 核心文件操作逻辑，包含 `checkAgentsMdExists()` 和 `copyAgentsMdTemplate()` |
| `src/commands/setup.ts` | setup 命令入口，调用上述函数 |

### 函数边界分析

**fileUtils.ts 中需要修改的函数：**

1. **`checkAgentsMdExists()` (line 57-60)**
   - 当前逻辑：检查 `process.cwd() + '/AGENTS.md'` 是否存在
   - 需要改为：检查 `process.cwd() + '/.agent-harness/AGENTS.md'`

2. **`copyAgentsMdTemplate()` (line 96-119)**
   - 当前逻辑：将模板复制到 `process.cwd() + '/AGENTS.md'`
   - 需要改为：
     - 先确保 `.agent-harness/` 目录存在
     - 将模板复制到 `process.cwd() + '/.agent-harness/AGENTS.md'`

3. **`createAgentHarnessDir()` (line 75-89)** - 已有，可以复用
   - 创建 `.agent-harness/` 目录
   - 已在 fileUtils.ts 中实现

---

## 执行计划

### 改动范围（最小改动原则）

采用最小改动原则，仅修改路径相关逻辑，不改变函数签名和返回逻辑。

### 具体修改

#### 1. 修改 `checkAgentsMdExists()` 函数

**当前代码 (line 57-60):**
```typescript
export function checkAgentsMdExists(): boolean {
  const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
  return fs.existsSync(agentsMdPath);
}
```

**修改为:**
```typescript
export function checkAgentsMdExists(): boolean {
  const agentsMdPath = path.join(process.cwd(), '.agent-harness', 'AGENTS.md');
  return fs.existsSync(agentsMdPath);
}
```

#### 2. 修改 `copyAgentsMdTemplate()` 函数

**当前代码 (line 96-119):**
```typescript
export function copyAgentsMdTemplate(): boolean {
  const sourcePath = path.join(__dirname, '..', 'templates', 'AGENTS.md');
  const destPath = path.join(process.cwd(), 'AGENTS.md');
  
  // Don't overwrite existing file
  if (fs.existsSync(destPath)) {
    return false;
  }
  
  if (!fs.existsSync(sourcePath)) {
    throw new FileOperationError(
      'Template file not found. Please ensure the project is properly installed.',
      'ENOENT',
      'copy_file'
    );
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    const friendlyMessage = getFriendlyErrorMessage(error as Error, 'copying AGENTS.md template');
    throw new FileOperationError(friendlyMessage, (error as any)?.code, 'copy_file');
  }
}
```

**修改为:**
```typescript
export function copyAgentsMdTemplate(): boolean {
  const sourcePath = path.join(__dirname, '..', 'templates', 'AGENTS.md');
  const destPath = path.join(process.cwd(), '.agent-harness', 'AGENTS.md');
  
  // Ensure .agent-harness directory exists
  createAgentHarnessDir();
  
  // Don't overwrite existing file
  if (fs.existsSync(destPath)) {
    return false;
  }
  
  if (!fs.existsSync(sourcePath)) {
    throw new FileOperationError(
      'Template file not found. Please ensure the project is properly installed.',
      'ENOENT',
      'copy_file'
    );
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    const friendlyMessage = getFriendlyErrorMessage(error as Error, 'copying AGENTS.md template');
    throw new FileOperationError(friendlyMessage, (error as any)?.code, 'copy_file');
  }
}
```

---

## 改动总结

| 函数 | 改动类型 | 改动内容 |
|------|----------|----------|
| `checkAgentsMdExists()` | 路径修改 | `'AGENTS.md'` → `'.agent-harness', 'AGENTS.md'` |
| `copyAgentsMdTemplate()` | 路径修改 + 新增调用 | 同上 + 添加 `createAgentHarnessDir()` 调用 |

---

## 验证方案

修改后需要验证：
1. 运行 `npm run build` 确保编译通过
2. 运行 `npm test` 确保测试通过
3. 手动测试 `agent-harness setup` 命令，确认 AGENTS.md 生成在 `.agent-harness/` 目录下

---

## 影响范围

- 仅修改 `src/utils/fileUtils.ts` 两个函数
- 不影响 setup.ts 中的调用逻辑（函数签名未变）
- 不影响其他模块

---

## 执行任务

- [x] 1. 修改 `checkAgentsMdExists()` 函数 - 更改路径到 `.agent-harness/AGENTS.md`
- [x] 2. 修改 `copyAgentsMdTemplate()` 函数 - 更改路径并添加 `createAgentHarnessDir()` 调用
- [x] 3. 验证修改 - 运行 build 和 test
- [ ] 2. 修改 `copyAgentsMdTemplate()` 函数 - 更改路径并添加 `createAgentHarnessDir()` 调用
- [ ] 3. 验证修改 - 运行 build 和 test