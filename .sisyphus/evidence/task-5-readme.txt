# Task 5 - README.md 更新验证

## 执行时间
2026-02-25

## 验证命令
```
grep -n ".agent-harness" README.md
```

## 验证结果
找到 6 处匹配：

1. 行 78: | `--output-dir` | `-o` | 输出目录 | `.agent-harness` |
2. 行 118: - `.agent-harness/feature_list.json` - 功能列表
3. 行 119: - `.agent-harness/progress.md` - 进度追踪
4. 行 120: - `.agent-harness/script/init.sh` - Unix 初始化脚本
5. 行 121: - `.agent-harness/script/init.bat` - Windows 批处理脚本
6. 行 122: - `.agent-harness/script/init.ps1` - Windows PowerShell 脚本

## 变更内容

### 1. 全局选项 - 默认输出目录
- 修改前: `"."` (当前目录)
- 修改后: `.agent-harness`

### 2. init 命令 - 生成的文件列表
- 移除: `project.md - 项目文档` (现由 scan 命令生成)
- 更新脚本路径: `.agent-harness/script/init.sh`, `init.bat`, `init.ps1`
- 添加说明: `project.md 由 scan 命令生成`

## 状态
✅ 验证通过 - README.md 正确反映新行为
