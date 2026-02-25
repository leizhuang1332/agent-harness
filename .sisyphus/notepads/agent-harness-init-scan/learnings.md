# agent-harness-init-scan 学习笔记

## 会议记录

### 2026-02-25 初始化

**用户需求**:
1. 生成的约束文件，默认保存在 .agent-harness 目录下
2. agent-harness init 初始化完成后默认执行 scan

**关键决策**:
- init.sh/init.bat/init.ps1 放在 `.agent-harness/script` 目录
- init 自动运行 scan，如果 scan 失败，init 仍然成功但提示警告
- 用户显式指定 -o 参数时，仍然自动运行 scan

## 代码位置
- 全局输出目录: src/index.ts:35
- project.md 生成: src/index.ts:77-97
- 脚本生成: src/index.ts:100-153
- scan 命令: src/index.ts:162-216
