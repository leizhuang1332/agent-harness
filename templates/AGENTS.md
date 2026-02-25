# AGENTS.md - Agent Coding Guidelines

Guidelines for AI agents working in this repository.

---

**先决条件**：

If the app-spec.txt file does not exist, it must be created first; otherwise, no further operations can be performed: 
```
use skill(name="app_spec") reading project generates an "app-spec.txt" file for the current project.
```
---

# WORKFLOW
Always open `@/coding_prompt.md` when the request:
read coding_prompt.md，Understand your WORKFLOW and follow the steps precisely.

 # 全局语言规范

1. **强制简体中文**：无论输入或工具返回何种语言，所有交互回复必须始终使用简体中文。
2. **翻译与保留**：工具或系统输出的英文信息需翻译为中文，代码、链接及技术术语保留原文。