# Agent Harness CLI

> 为长时间运行的 AI 代理生成约束文件的跨平台 CLI 工具

基于 Anthropic 的 "Effective Harnesses for Long-Running Agents" 和 OpenSpec 灵感打造。

## 特性

- 🚀 **跨平台支持** - Windows、macOS、Linux 原生支持
- 📦 **快速初始化** - 一键生成项目约束文件
- 🔍 **智能扫描** - 自动检测项目技术栈
- 🎯 **TypeScript** - 完全类型安全
- 📝 **完整文档** - 生成 feature_list.json、progress.md、project.md

## 安装

### 从 npm 安装（全局）

```bash
npm install -g agent-harness
```

### 从源码构建

```bash
# 克隆仓库
git clone <repository-url>
cd agent-harness

# 安装依赖
npm install

# 构建项目
npm run build

# 链接全局命令
npm link
```

## 快速开始

### 初始化新项目

```bash
# 在当前目录创建约束文件
agent-harness init

# 指定输出目录
agent-harness init --output-dir ./my-project

# 自定义项目名称
agent-harness init --project-name "my-awesome-project"

# 强制覆盖已存在的文件
agent-harness init --force
```

### 扫描现有项目

```bash
# 扫描当前目录
agent-harness scan

# 扫描指定目录
agent-harness scan --path ./my-existing-project

# 输出到指定目录
agent-harness scan --output-dir ./output
```

## 命令详解

### 全局选项

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--force` | `-f` | 强制覆盖已存在的文件 | false |
| `--output-dir` | `-o` | 输出目录 | "." |
| `--verbose` | `-v` | 显示详细调试信息 | false |
| `--version` | `-V` | 显示版本号 | - |
| `--help` | `-h` | 显示帮助信息 | - |

### init 命令

初始化一个新的代理项目约束文件。

```bash
agent-harness init [options]
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--project-name` | `-n` | 项目名称 | "my-agent-project" |
| `--description` | `-d` | 项目描述 | "Agent harness project" |

**示例：**

```bash
# 基本用法
agent-harness init

# 完整示例
agent-harness init -n "my-project" -d "My AI Agent Project" -o ./output --verbose
```

**生成的文件：**

- `feature_list.json` - 功能列表
- `progress.md` - 进度追踪
- `project.md` - 项目文档
- `init.sh` - Unix 初始化脚本
- `init.bat` - Windows 批处理脚本
- `init.ps1` - Windows PowerShell 脚本

### scan 命令

扫描现有项目并生成 project.md。

```bash
agent-harness scan [options]
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--path` | `-p` | 要扫描的目录 | 当前目录 |

**示例：**

```bash
# 扫描当前目录
agent-harness scan

# 扫描指定目录
agent-harness scan --path ./my-project

# 输出到指定目录
agent-harness scan -o ./docs
```

## 项目结构

```
agent-harness/
├── src/
│   ├── index.ts          # CLI 入口
│   ├── generators/       # 文件生成器
│   │   ├── featureList.ts
│   │   ├── progress.ts
│   │   ├── project.ts
│   │   └── writer.ts
│   ├── scanner/          # 项目扫描器
│   │   ├── scanner.ts
│   │   ├── techStack.ts
│   │   └── projectGenerator.ts
│   └── utils/            # 工具函数
│       ├── logger.ts
│       ├── path.ts
│       └── platform.ts
├── templates/            # 脚本模板
│   ├── init.sh
│   ├── init.bat
│   └── init.ps1
├── dist/                # 编译输出
├── package.json
└── tsconfig.json
```

## 技术栈检测

`scan` 命令自动检测以下技术：

### 框架

- 前端：React、Vue、Angular、Svelte
- 后端：Express、Fastify、NestJS、Koa、Hapi
- 全栈：Next.js、Nuxt、Remix、Astro

### 运行时

- Node.js、Deno、Bun

### 工具

- ESLint、Prettier、Vitest、Jest、Cypress、Playwright

### 语言

- TypeScript、JavaScript、Python、Rust、Go、Java、C++、Ruby、PHP

## 约束文件格式

### feature_list.json

```json
[
  {
    "category": "Setup",
    "description": "Initialize project with package.json",
    "steps": [
      "Create package.json",
      "Install dependencies"
    ],
    "passes": false
  }
]
```

### progress.md

```markdown
# Progress

## Session History
| Date | Session | Changes |
|------|---------|---------|
| - | - | - |

## Current Status
- Active Session: -
- Last Updated: -

## Completed Features
- None yet

## Pending Features
- All features pending
```

### project.md

```markdown
# Project: My Project

Project scanned from /path/to/project

## Tech Stack
- Language: TypeScript
- Framework: Express

## Architecture
[To be documented]

## Commands
| Command | Description |
|---------|-------------|
| npm install | Install dependencies |
| npm run dev | Start development server |

## Constraints
- [To be documented]
```

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

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
