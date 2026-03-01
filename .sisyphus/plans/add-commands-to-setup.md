# 计划：为 agent-harness setup 增加创建 Command 功能

## TL;DR

> 在 `agent-harness setup` 命令中增加为 AI 助手创建 command 的功能，类似于现有的 skill 安装逻辑。
> 
> **交付物**：
> - 新增 `installCommands.ts` 工具模块
> - 修改 `setup.ts` 增加 command 选项
> - 命令行选项：用户可选择为 OpenCode/Qwen 创建 commands
> 
> **预计工作量**：Short
> **并行执行**：NO（顺序改动）

---

## 上下文

### 原始需求
用户要求在执行 `agent-harness setup` 命令时，增加为 AI 助手创建 command 的功能：
1. OpenCode 的 command 目录：`<项目根目录>/.opencode/commands/`
2. Qwen 的 command 目录：`<项目根目录>/.qwen/commands/`

### 代码分析

**现有文件结构**：
```
src/
├── commands/
│   └── setup.ts              # 主入口命令
├── utils/
│   ├── fileUtils.ts           # 文件操作工具
│   ├── installSkills.ts       # Skill 安装逻辑 ← 参考模板
│   └── detectAssistants.ts    # AI 助手检测
└── templates/
    ├── skills/               # Skill 模板源目录
    │   ├── app-spec/
    │   └── plan2feat/
    └── commands/              # Command 模板源目录（已存在但为空）
        └── agent-harness-init.md
```

**关键代码参考**（`installSkills.ts`）：
- `installToOpenCode()`: 复制 skills 到 `.opencode/skills/`
- `installToQwenCode()`: 复制 skills 到 `.qwen/skills/`
- `installSkills(targets)`: 分发安装任务

**目标目录映射**：
| 类型 | 源目录 | OpenCode 目标 | Qwen 目标 |
|------|--------|---------------|-----------|
| Skill | `src/templates/skills/` | `.opencode/skills/` | `.qwen/skills/` |
| Command | `src/templates/commands/` | `.opencode/commands/` | `.qwen/commands/` |

---

## 工作目标

### 核心目标
在 setup 命令中增加对 commands 的安装支持，模式与 skill 安装一致。

### 具体交付物
1. 新增 `src/utils/installCommands.ts` - Command 安装模块
2. 修改 `src/commands/setup.ts` - 增加 command 选项
3. 补充 `src/templates/commands/` 模板内容（如果需要）

### 定义完成
- [ ] `installCommands.ts` 模块可独立测试
- [ ] setup 命令可以成功为 OpenCode 创建 commands
- [ ] setup 命令可以成功为 Qwen 创建 commands
- [ ] 与现有 skill 功能共存无冲突

### 必须包含
- 错误处理（权限、路径不存在等）
- 与 skill 安装一致的用户提示
- 覆盖检测已有 command 时的覆盖逻辑

### 必须不包含（防护栏）
- 不修改现有 skill 安装逻辑
- 不添加全局配置（仅项目级别）

---

## 验证策略

### 测试策略
- **基础设施**：已有 vitest
- **测试方式**：测试后置（修改现有测试）
- **框架**：vitest

### QA 场景
每个任务必须包含 Agent-Executed QA Scenarios：

**场景 1：OpenCode Command 安装**
- 工具：Bash
- 前置条件：项目目录存在 `.opencode/commands/` 目录不存在
- 步骤：
  1. 运行 `node dist/index.js setup`（mock 交互输入）
  2. 选择创建 command
  3. 选择 OpenCode
- 预期结果：`.opencode/commands/agent-harness-init.md` 存在
- 证据：`.sisyphus/evidence/task-N-opencode-command.{ext}`

**场景 2：Qwen Command 安装**
- 工具：Bash
- 前置条件：项目目录存在
- 步骤：类似 OpenCode 但选择 Qwen
- 预期结果：`.qwen/commands/agent-harness-init.md` 存在
- 证据：`.sisyphus/evidence/task-N-qwen-command.{ext}`

---

## 执行策略

### 任务顺序

**Wave 1（顺序执行 - 依赖清晰）**：

| 序号 | 任务 | 依赖 | 分类 |
|------|------|------|------|
| 1 | 创建 installCommands.ts 模块 | 无 | quick |
| 2 | 修改 setup.ts 增加 command 选项 | 1 | quick |
| 3 | 测试 command 安装功能 | 1,2 | unspecified-high |

### 依赖矩阵

```
installCommands.ts (1)  → setup.ts (2) → 测试 (3)
```

---

## 待办事项

- [x] 1. 创建 installCommands.ts 模块

  **做什么**：
  - 创建 `src/utils/installCommands.ts`
  - 参考 `installSkills.ts` 实现：
    - `getCommandsSourceDir()`: 返回 `src/templates/commands/`
    - `getCommandsList()`: 获取 commands 目录列表
    - `copyCommandDir()`: 复制单个 command 目录
    - `installToOpenCodeCommands()`: 安装到 `.opencode/commands/`
    - `installToQwenCodeCommands()`: 安装到 `.qwen/commands/`
    - `installCommands(targets)`: 分发函数
  - 错误处理参考现有模式

  **不能做**：
  - 不修改 installSkills.ts

  **推荐 Agent 配置**：
  - 分类：`quick`
  - 理由：模板代码，参考现有实现即可

  **并行化**：
  - 可以并行：NO
  - 顺序：独立模块
  - 阻塞：任务 2
  - 被阻塞：无

  **参考**：
  - `src/utils/installSkills.ts:188-220` - installToOpenCode 实现
  - `src/utils/installSkills.ts:226-258` - installToQwenCode 实现

  **验收标准**：
  - [ ] `src/utils/installCommands.ts` 文件创建
  - [ ] 模块导出 `installCommands` 函数
  - [ ] TypeScript 编译通过

  **QA 场景**：
  ```
  场景：模块基本功能
    工具：Bash
    步骤：
      1. cd src && npx tsc --noEmit
    预期结果：无编译错误
  ```

- [x] 2. 修改 setup.ts 增加 command 选项

  **做什么**：
  - 修改 `src/commands/setup.ts`：
    1. 在文件选择列表增加 "Commands" 选项
    2. 在 AI 助手选择后，增加 command 安装步骤（类似 skill 步骤 5）
    3. 导入 `installCommands` 并调用
    4. 更新提示文本

  **不能做**：
  - 不修改 skill 相关的现有逻辑

  **推荐 Agent 配置**：
  - 分类：`quick`
  - 理由：简单修改，参考现有模式

  **并行化**：
  - 可以并行：NO
  - 顺序：依赖任务 1
  - 阻塞：任务 3
  - 被阻塞：任务 1

  **参考**：
  - `src/commands/setup.ts:28-46` - 文件选择逻辑
  - `src/commands/setup.ts:125-164` - skill 安装逻辑（参考模板）

  **验收标准**：
  - [ ] setup 命令运行时显示 "Commands" 选项
  - [ ] 选择后调用 installCommands
  - [ ] 成功/失败信息正确显示

  **QA 场景**：
  ```
  场景：命令行帮助显示
    工具：Bash
    步骤：
      1. node dist/index.js setup --help
    预期结果：显示帮助信息，无错误

  场景：实际运行（需要 mock 交互）
    工具：Bash
    步骤：
      1. 创建测试目录
      2. 运行 setup 命令，注入输入
    预期结果：Commands 选项出现
  ```

- [x] 3. 测试 command 安装功能

  **做什么**：
  - 运行完整测试验证功能
  - 测试 OpenCode 和 Qwen 两种情况
  - 清理测试生成的文件

  **推荐 Agent 配置**：
  - 分类：`unspecified-high`
  - 理由：集成测试，需要实际运行验证

  **并行化**：
  - 可以并行：NO
  - 顺序：依赖任务 1,2
  - 阻塞：无
  - 被阻塞：无

  **验收标准**：
  - [ ] OpenCode: `.opencode/commands/agent-harness-init.md` 存在
  - [ ] Qwen: `.qwen/commands/agent-harness-init.md` 存在

  **QA 场景**：
  ```
  场景：OpenCode Command 安装
    工具：Bash
    步骤：
      1. 创建临时测试目录
      2. 运行 setup 命令并选择 OpenCode + Commands
    预期结果：.opencode/commands/agent-harness-init.md 存在

  场景：Qwen Command 安装
    工具：Bash
    步骤：
      1. 创建临时测试目录
      2. 运行 setup 命令并选择 Qwen + Commands
    预期结果：.qwen/commands/agent-harness-init.md 存在
  ```

---

## 最终验证

### 验证命令
```bash
# 构建项目
npm run build

# 运行 setup（需要 mock 交互或测试脚本）
node dist/index.js setup
```

### 最终检查清单
- [ ] 所有 "Must Have" 存在
- [ ] 所有 "Must NOT Have" 不存在
- [ ] 编译通过
- [ ] 与现有 skill 功能共存
