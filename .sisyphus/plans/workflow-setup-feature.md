# 执行计划：agent-harness setup 命令增加 workflow.md 功能

## TL;DR

> **快速摘要**：在 setup 命令中增加自动复制 workflow.md 模板到 `.agent-harness/` 目录的功能

> **交付物**：
> - 修改 `src/utils/fileUtils.ts`：新增 `copyWorkflowTemplate()` 函数
> - 修改 `src/commands/setup.ts`：导入并自动调用复制函数

> **估计工作量**: 简单 | **并行执行**: 否（顺序修改） | **关键路径**: fileUtils.ts → setup.ts

---

## 上下文

### 原始需求
用户要求在 agent-harness setup 命令中增加生成 workflow.md 的功能：
1. 将 `src/templates/workflow.md` 复制到 `<project-root>/.agent-harness/workflow.md`
2. 默认执行该操作，不需要与用户交互

### 访谈总结
**已确认的需求**：
- workflow.md 必须复制到 `.agent-harness/` 目录（不是项目根目录）
- 该操作自动执行，无需用户确认
- 遵循现有代码模式和错误处理方式

### Metis 评审
**识别的边界**：
- 目标路径是 `.agent-harness/workflow.md`，不是 `AGENTS.md`（项目根目录）
- 需要确保 `.agent-harness/` 目录存在
- 参考现有 `copyAgentsMdTemplate()` 模式实现

---

## 工作目标

### 核心目标
在 setup 命令执行过程中，自动将 workflow.md 模板复制到 `.agent-harness/` 目录

### 具体交付物
- [ ] 修改 `src/utils/fileUtils.ts`：新增 `copyWorkflowTemplate()` 函数
- [ ] 修改 `src/commands/setup.ts`：导入并调用新函数

### 定义完成
- [ ] `copyWorkflowTemplate()` 函数正确复制文件到目标位置
- [ ] setup 命令执行后 `.agent-harness/workflow.md` 文件存在
- [ ] 错误处理与现有模式一致

### 必须有
- 遵循现有代码风格和错误处理模式
- 最小改动原则

### 禁止有
- 不要修改任何现有功能逻辑
- 不要添加用户交互提示

---

## 验证策略

### 测试决策
- **基础设施存在**: 是 (vitest)
- **自动化测试**: 否（此为简单改动，人工验证即可）
- **框架**: 无

### QA 策略
每个任务必须包含 agent-executed QA 场景。

---

## 执行策略

### 任务分解
```
任务 1: 修改 fileUtils.ts - 新增 copyWorkflowTemplate 函数
任务 2: 修改 setup.ts - 导入并调用新函数
任务 3: 验证 - 测试功能

关键路径: 任务 1 → 任务 2 → 任务 3
```

---

## 待办事项

- [x] 1. 修改 fileUtils.ts - 新增 copyWorkflowTemplate 函数

  **执行内容**:
  - 在 `src/utils/fileUtils.ts` 中新增 `copyWorkflowTemplate()` 函数
  - 源文件路径: `path.join(__dirname, '..', 'templates', 'workflow.md')`
  - 目标文件路径: `path.join(process.cwd(), '.agent-harness', 'workflow.md')`
  - 逻辑与 `copyAgentsMdTemplate()` 相同，但目标目录为 `.agent-harness/`
  - 创建目标目录（如果不存在）

  **禁止执行**:
  - 不修改现有函数逻辑
  - 不添加额外的错误处理分支

  **推荐代理配置**:
  > - **类别**: `quick` - 简单函数添加
  > - **技能**: 无

  **并行化**:
  - **可并行运行**: 否
  - **顺序**: 任务 1 必须先于任务 2
  - **阻塞**: 无
  - **依赖**: 无

  **参考**:
  - `src/utils/fileUtils.ts:96-123` - copyAgentsMdTemplate() 函数实现模式
  - `src/templates/workflow.md` - 源模板文件

  **验收标准**:
  - [ ] `copyWorkflowTemplate()` 函数存在且可导出
  - [ ] 函数正确复制文件到 `.agent-harness/workflow.md`

  **QA 场景**:

  ```
  场景: workflow.md 文件正确复制
    工具: Bash
    前提条件: 项目已构建
    步骤:
      1. 运行 `npx ts-node src/utils/fileUtils.ts` 或导入测试
      2. 调用 copyWorkflowTemplate() 函数
      3. 检查 `.agent-harness/workflow.md` 文件是否存在
    预期结果: 文件存在，内容与模板一致
    失败指示: 文件不存在或内容错误
    证据: 无
  ```

- [x] 2. 修改 setup.ts - 导入并调用 copyWorkflowTemplate

  **执行内容**:
  - 在 `src/commands/setup.ts` 顶部导入 `copyWorkflowTemplate`
  - 在 setup 命令执行流程中调用该函数
  - 位置建议：在创建 AGENTS.md 之后、skills 安装之前
  - 无需用户交互，直接调用

  **禁止执行**:
  - 不修改现有用户交互逻辑
  - 不添加新的 inquirer 提示

  **推荐代理配置**:
  > - **类别**: `quick` - 简单修改
  > - **技能**: 无

  **并行化**:
  - **可并行运行**: 否
  - **顺序**: 任务 2 在任务 1 之后
  - **阻塞**: 任务 1
  - **依赖**: 任务 1

  **参考**:
  - `src/commands/setup.ts:10` - 现有 fileUtils 导入
  - `src/commands/setup.ts:99-111` - 调用 copyAgentsMdTemplate 的位置

  **验收标准**:
  - [ ] 导入语句正确
  - [ ] 函数在 setup 流程中被调用

  **QA 场景**:

  ```
  场景: setup 命令自动复制 workflow.md
    工具: Bash
    前提条件: 修改后的代码已构建
    步骤:
      1. 在空目录中运行 `agent-harness setup`
      2. 回答所有交互问题
      3. 检查 `.agent-harness/workflow.md` 是否存在
    预期结果: 文件存在，内容正确
    失败指示: 文件不存在
    证据: 无
  ```

---

## 最终验证

- [ ] F1. 代码审查 - 检查改动是否符合最小改动原则
- [x] F2. 构建验证 - `npm run build` 成功
- [x] F3. 功能验证 - 手动测试 setup 命令

---

## 提交策略

- **提交**: 是
- **信息**: `feat(setup): 自动复制 workflow.md 到 .agent-harness 目录`

---

## 成功标准

### 验证命令
```bash
# 构建
npm run build

# 测试 (可选)
npm test
```

### 最终检查清单
- [ ] copyWorkflowTemplate() 函数已添加
- [ ] setup.ts 正确导入并调用
- [ ] 构建成功
- [ ] 功能验证通过
