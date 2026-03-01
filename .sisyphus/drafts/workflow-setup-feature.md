# 草案：agent-harness setup 命令增加 workflow.md 功能

## 需求理解
1. 将 `src/templates/workflow.md` 复制到 `<project-root>/.agent-harness/workflow.md`
2. 默认执行该操作，不需要与用户交互

## 代码分析

### 现有 setup.ts 结构
- 第 26 行: setupCommand.action 开始执行
- 第 29-36 行: 询问用户是否创建 AGENTS.md (使用 inquirer)
- 第 100-111 行: 复制 AGENTS.md 模板的逻辑

### 现有 fileUtils.ts 结构
- 第 96-123 行: `copyAgentsMdTemplate()` 函数
- 复制 `templates/AGENTS.md` 到 `process.cwd()/AGENTS.md`
- 返回 boolean 表示成功/失败

### 需要新增的函数边界
1. **fileUtils.ts**: 新增 `copyWorkflowTemplate()` 函数
   - 源文件: `src/templates/workflow.md`
   - 目标文件: `<project-root>/.agent-harness/workflow.md`
   - 模式: 参考 `copyAgentsMdTemplate()`

2. **setup.ts**: 修改
   - 导入: `copyWorkflowTemplate`
   - 调用: 在文件创建步骤中自动调用（无需用户交互）

## 改动范围
- **修改文件**: 2 个 (fileUtils.ts, setup.ts)
- **新增函数**: 1 个 (copyWorkflowTemplate)
- **新增导入**: 1 个
- **改动行数**: 约 10-15 行

## 原则
- 最小改动原则：参考现有模式，不破坏现有逻辑
- 默认执行：自动复制，无需交互
