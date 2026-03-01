# 修复 agent-harness setup 命令安装问题

## TL;DR

> 修改 `getCommandsList()` 和 `copyCommandDir()` 函数，使命令安装适配现有的文件结构（而不是目录结构）

**目标**: 修复 command 安装后 .opencode/commands 目录为空的问题
**原因**: `getCommandsList()` 期望目录但模板是文件
**修复**: 改为读取 .md 文件并直接复制

---

## Context

### 问题描述
执行 `agent-harness setup` 后，`.opencode/commands/` 目录为空或没有正确安装命令文件。

### 根因分析
`src/utils/installCommands.ts` 中的逻辑是为「目录结构」设计的：
- `getCommandsList()` 过滤 `isDirectory()` — 只返回子目录
- `copyCommandDir()` 调用 `copyDirRecursive()` — 复制目录

但实际模板目录结构是：
```
src/templates/commands/
└── agent-harness-init.md   ← 文件，不是目录
```

### 用户要求
- **不改变** `src/templates/commands/` 的现有结构
- 修改 `getCommandsList()` 函数来适配
- 安装后结构：
```
.opencode/
├── commands/    
│   ├── agent-harness-init.md
```

---

## Work Objectives

### 修改文件
- `src/utils/installCommands.ts`

### 修改内容

#### 1. 修改 `getCommandsList()` (第68-86行)

**当前代码**:
```typescript
return fs.readdirSync(commandsDir).filter(item => {
  const itemPath = path.join(commandsDir, item);
  return fs.statSync(itemPath).isDirectory();
});
```

**修改为**:
```typescript
// Return .md files directly (not directories)
return fs.readdirSync(commandsDir).filter(item => {
  const itemPath = path.join(commandsDir, item);
  return fs.statSync(itemPath).isFile() && item.endsWith('.md');
});
```

#### 2. 修改 `copyCommandDir()` (第137-182行)

**当前逻辑**: 调用 `copyDirRecursive()` 复制目录

**修改为**: 直接使用 `fs.copyFileSync()` 复制单个文件

---

## Verification Strategy

### 测试步骤

1. **构建项目**:
```bash
npm run build
```

2. **创建一个测试目录并运行 setup**:
```bash
mkdir /tmp/test-harness && cd /tmp/test-harness
agent-harness setup
```

3. **验证安装结果**:
```bash
ls -la .opencode/commands/
# 预期输出: agent-harness-init.md
```

4. **验证文件内容**:
```bash
cat .opencode/commands/agent-harness-init.md
# 预期: 与 src/templates/commands/agent-harness-init.md 内容一致
```

---

## Execution

### 改动范围
- 仅修改 `src/utils/installCommands.ts`
- 改动函数: `getCommandsList()`, `copyCommandDir()`
- 代码行数变化: ~20行

### 最小改动原则
- 不新增文件
- 不删除文件
- 不改变模板目录结构
- 向后兼容（如果未来改用目录结构，需要再次修改）

---

## Success Criteria

- [ ] `npm run build` 成功
- [ ] `agent-harness setup` 执行后 `.opencode/commands/` 包含 `.md` 文件
- [x] `npm run build` 成功
- [x] `agent-harness setup` 执行后 `.opencode/commands/` 包含 `.md` 文件
- [x] 安装的文件内容与模板一致
