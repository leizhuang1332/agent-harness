# AGENTS.md - Agent Coding Guidelines

Guidelines for AI agents working in this repository.

---

# 项目规格说明

Always read `.agent-harness/app-spec.txt` to understand the project specifications

**注意**：如果 `.agent-harness/app-spec.txt` 文件不存在，必须先创建该文件；否则，不能进行任何操作。

**创建该文件的命令如下**：

```bash
use skill(name="app_spec")
# or
use_skill [skill_name=app-spec]
```
# 工作流程

`.agent-harness/workflow.md` 此文件包含了项目的工作流程，每次开始开发前，必须执行按照此文件中的步骤进行。

 # 全局语言规范

1. **强制简体中文**：无论输入或工具返回何种语言，所有交互回复必须始终使用简体中文。
2. **翻译与保留**：工具或系统输出的英文信息需翻译为中文，代码、链接及技术术语保留原文。