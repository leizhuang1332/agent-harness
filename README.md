# Agent Harness

> 为长时间运行的 AI 代理生成约束文件的跨平台 CLI 工具

基于 Anthropic 的 "Effective Harnesses for Long-Running Agents" 理念打造。

## 特性

- 🚀 **跨平台支持** - Windows、macOS、Linux 原生支持
- ⚙️ **多 AI 助手集成** - 支持 OpenCode、Claude Desktop、Cursor、Qwen Code
- 🎯 **自定义技能安装** - 自动安装项目技能到 AI 助手
- 📦 **交互式配置** - 向导式引导完成项目初始化
- 🔧 **完整工作流** - 支持自主开发的完整约束文件体系
- 📝 **TypeScript** - 完全类型安全

## 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-repo/agent-harness.git
cd agent-harness

# 安装依赖
npm install

# 构建项目
npm run build

# 链接全局命令
npm link
```

### 初始化项目

```bash
# 启动交互式设置
agent-harness setup
```

交互式流程：
1. 选择要创建的文件（AGENTS.md、coding_prompt.md）
2. 选择要安装技能的 AI 助手
3. 自动创建文件并安装技能

## 项目架构

```
agent-harness/
├── src/
│   ├── index.ts                    # CLI 入口 (Commander)
│   ├── commands/
│   │   └── setup.ts                # 交互式设置命令
│   └── utils/
│       ├── fileUtils.ts             # 文件操作工具
│       ├── installSkills.ts          # 技能安装器
│       └── detectAssistants.ts      # AI 助手检测
├── skills/                          # AI 助手技能
│   ├── plan2features/               # 计划转功能列表
│   │   └── SKILL.md
│   └── app-spec/                    # 项目规格生成器
│       └── SKILL.md
├── templates/                       # 模板文件
│   ├── AGENTS.md                   # Agent 配置指南
│   ├── coding_prompt.md             # 编码工作流
│   ├── init.sh                     # Unix 初始化脚本
│   ├── init.bat                    # Windows 批处理
│   └── init.ps1                    # PowerShell 脚本
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 核心功能

### 1. AI 助手检测

自动检测系统上安装的 AI 助手：

| 助手 | 检测方式 |
|------|----------|
| OpenCode | `~/.config/opencode/` 目录 |
| Claude Desktop | `~/Library/Application Support/Claude/` (macOS) |
| Cursor | `~/.cursor/` 目录 |
| Qwen Code | `qwen-code --version` 命令 |

### 2. 技能系统

项目内置两个核心技能：

#### plan2features
将开发计划文档转换为结构化功能列表 (`feature_list.json`)

```bash
# 使用方式
use skill(name="plan2features")
```

#### app-spec
生成完整的项目规格文档 (`app-spec.txt`)

```bash
# 使用方式
use skill(name="app-spec")
```

### 3. 模板文件

- **AGENTS.md** - AI Agent 工作指南，包含全局语言规范（强制简体中文）
- **coding_prompt.md** - 编码 Agent 工作流：
  1. 获取项目概要（读取 app_spec.txt, feature_list.json）
  2. 选择一个功能实现
  3. 编写代码和单元测试
  4. 更新 feature_list.json（仅修改 passes 字段）
  5. Git 提交
  6. 更新进度笔记

## 命令详解

### setup 命令

```bash
agent-harness setup
```

**功能：**
- 创建 AGENTS.md（项目根目录）
- 创建 .agent-harness/coding_prompt.md
- 安装技能到选定的 AI 助手

**生成的目录结构：**
```
project/
├── AGENTS.md
└── .agent-harness/
    └── coding_prompt.md
```

## 技术栈

### 运行时
- Node.js 18+

### 核心依赖
- **commander** - CLI 框架
- **inquirer** - 交互式提示
- **ora** - 加载动画
- **chalk** - 终端着色
- **archiver** - ZIP 压缩
- **cross-spawn** - 跨平台进程

### 开发依赖
- TypeScript 5.x
- Vitest (测试)

## 开发指南

### 构建

```bash
npm run build
```

### 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch
```

### 类型检查

```bash
npx tsc --noEmit
```

## 约束文件格式

### feature_list.json

```json
[
  {
    "id": 1,
    "category": "Setup",
    "description": "Initialize project structure",
    "source": "plan.md",
    "priority": "p0",
    "steps": [
      "1: Create directory structure",
      "2: Initialize package.json"
    ],
    "passes": false
  }
]
```

### app-spec.xml

完整的项目规格包含：
- 项目概述
- 技术栈（前端、后端、数据库）
- 核心功能列表
- 数据库 schema
- 数据层设计
- UI 布局
- 设计系统
- 关键交互流程
- 实现步骤
- 成功标准

## 许可证

MIT License
