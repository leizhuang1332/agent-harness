# agent-harness init & scan 优化计划

## TL;DR

> **快速总结**: 修改 agent-harness CLI，默认将约束文件输出到 `.agent-harness` 目录，init 命令完成后自动执行 scan 生成真实的 project.md
> 
> **交付物**: 
> - 修改后的 CLI 工具
> - 更新后的 README 文档
> 
> **估计工作量**: Short
> **并行执行**: NO - 顺序执行（任务有依赖）
> **关键路径**: 修改默认目录 → 移除 init 中 project.md 生成 → init 末尾添加 scan 调用 → 创建 script 目录移动脚本 → 更新文档

---

## Context

### 原始需求
1. 生成的约束文件，默认保存在 .agent-harness 目录下
2. agent-harness init 初始化完成后默认执行 scan，初始化时不用生成 project.md，执行 scan 后会按真实项目情况生成

### 访谈总结
**关键讨论**:
- init.sh/init.bat/init.ps1 放在 `.agent-harness/script` 目录
- init 自动运行 scan，如果 scan 失败，init 仍然成功但提示警告
- 用户显式指定 -o 参数时，仍然自动运行 scan

**研究结果**:
- src/index.ts 是主要修改点
- 全局默认输出目录在第35行定义
- init 命令在第39-160行，scan 命令在第162-216行

### Metis 评审
**已解决的差距**:
- 默认输出目录从 "." 改为 ".agent-harness"
- init 不再生成 project.md（由 scan 生成）
- init 末尾添加自动 scan 调用
- 脚本文件移动到 .agent-harness/script 目录

---

## Work Objectives

### 核心目标
修改 agent-harness CLI 工具，实现：
1. 约束文件默认输出到 `.agent-harness` 目录
2. init 命令完成后自动执行 scan
3. project.md 由 scan 基于真实项目情况生成

### 具体交付物
- 修改后的 src/index.ts
- 更新后的 README.md 文档

### 完成定义
- [ ] `agent-harness init` 默认输出到 .agent-harness 目录
- [ ] .agent-harness/feature_list.json 存在
- [ ] .agent-harness/progress.md 存在
- [ ] .agent-harness/script/init.sh, .agent-harness/script/init.bat, .agent-harness/script/init.ps1 存在
- [ ] .agent-harness/project.md 由 scan 生成（包含真实技术栈）
- [ ] 手动运行 `agent-harness scan` 仍然正常工作

### Must Have
- 默认输出目录必须是 .agent-harness
- init 后自动运行 scan
- scan 命令保持独立可用

### Must NOT Have (Guardrails)
- 不修改 scan 的扫描逻辑
- 不修改 feature_list.json 模板内容
- 不添加新的 CLI 选项（用户未要求）
- 不修改 writer.ts 或其他生成器内部逻辑

---

## Verification Strategy (MANDATORY)

> **零人工干预** — 所有验证均由 agent 执行。没有例外。
> 需要人工手动测试/确认的验收标准是禁止的。

### 测试决策
- **基础设施存在**: YES（现有项目）
- **自动化测试**: None（CLI 工具，依赖手动测试）
- **框架**: N/A
- **Agent 执行 QA**: 每次任务后执行验证命令

### QA 策略
每个任务必须包含 agent 可执行的 QA 场景（见 TODO 模板）。

---

## Execution Strategy

### 顺序执行（任务有依赖关系）

```
Wave 1 (立即开始 - 核心修改):
├── Task 1: 修改全局默认输出目录 [quick]
├── Task 2: 修改 init - 移除 project.md 生成 [quick]
├── Task 3: 修改 init - 末尾添加 scan 调用 [quick]
├── Task 4: 创建 script 目录并移动脚本文件 [quick]
└── Task 5: 更新 README.md 文档 [writing]

Wave 2 (Wave 1 完成后 - 测试验证):
└── Task 6: 集成测试验证 [quick]
```

---

## TODOs

- [x] 1. 修改全局默认输出目录

  **What to do**:
  - 将 src/index.ts 第35行的默认值从 "." 改为 ".agent-harness"
  - 修改描述文本 "default: current directory" 为 "default: .agent-harness directory"

  **Must NOT do**:
  - 不修改其他全局选项
  - 不修改 -o 参数的行为

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的单行代码修改
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: 2, 3, 4
  - **Blocked By**: None

  **References**:
  - `src/index.ts:35` - 全局选项定义位置

  **Acceptance Criteria**:
  - [ ] grep 确认默认值已更改

  **QA Scenarios**:

  ```
  Scenario: 验证默认输出目录配置已更改
    Tool: Bash
    Preconditions: 无
    Steps:
      1. 执行 grep 命令检查默认值
    Expected Result: 输出包含 ".agent-harness" 作为默认值
    Evidence: .sisyphus/evidence/task-1-default-dir.{ext}
  ```

  **Evidence to Capture**:
  - [ ] grep 输出保存到证据文件

  **Commit**: NO

- [x] 2. 修改 init 命令 - 移除 project.md 生成

  **What to do**:
  - 删除 src/index.ts 中 init action 内的 project.md 生成代码（第77-97行）
  - 保留 feature_list.json, progress.md, init.sh, init.bat, init.ps1 的生成逻辑
  - 删除对应的 generateProjectTemplate 导入（如果不再需要）

  **Must NOT do**:
  - 不修改其他生成逻辑
  - 不修改 feature_list.json 或 progress.md 的内容

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 删除代码块的小范围修改
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: 3
  - **Blocked By**: 1

  **References**:
  - `src/index.ts:77-97` - project.md 生成代码位置

  **Acceptance Criteria**:
  - [ ] init action 中不再调用 generateProjectTemplate

  **QA Scenarios**:

  ```
  Scenario: 验证 init 不再生成 project.md
    Tool: Bash
    Preconditions: 无
    Steps:
      1. 检查 init action 代码中无 project.md 相关生成
    Expected Result: 无 generateProjectTemplate 调用在 init action 内
    Evidence: .sisyphus/evidence/task-2-no-projectmd.{ext}
  ```

  **Evidence to Capture**:
  - [ ] grep 输出保存到证据文件

  **Commit**: NO

- [x] 3. 修改 init 命令 - 末尾添加 scan 调用

  **What to do**:
  - 在 init action 的成功日志 "Project initialization complete!" 之前添加 scan 调用逻辑
  - scan 调用应该复用 scan 命令的扫描和生成逻辑
  - 如果 scan 失败，仅输出警告日志，不影响 init 的成功状态
  - 确保使用与 init 相同的输出目录

  **Must NOT do**:
  - 不修改 scan 命令的独立行为
  - 不改变输出目录逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 添加代码逻辑的修改
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: 4, 6
  - **Blocked By**: 2

  **References**:
  - `src/index.ts:162-216` - scan 命令实现参考

  **Acceptance Criteria**:
  - [ ] init 命令执行后会调用 scan
  - [ ] scan 失败不会导致 init 失败

  **QA Scenarios**:

  ```
  Scenario: 验证 init 包含 scan 调用
    Tool: Bash
    Preconditions: 无
    Steps:
      1. 检查 init action 代码中包含 scan 调用
    Expected Result: 代码中包含对 scanProject 和 generateProjectMarkdown 的调用
    Evidence: .sisyphus/evidence/task-3-scan-call.{ext}
  ```

  **Evidence to Capture**:
  - [ ] 代码审查输出保存到证据文件

  **Commit**: NO

- [x] 4. 创建 script 目录并移动脚本文件

  **What to do**:
  - 修改 init action 中脚本文件的生成路径
  - 从 `path.join(outputDir, 'init.sh')` 改为 `path.join(outputDir, 'script', 'init.sh')`
  - 对 init.sh, init.bat, init.ps1 都做同样修改

  **Must NOT do**:
  - 不修改脚本内容

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 路径修改
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: 6
  - **Blocked By**: 3

  **References**:
  - `src/index.ts:100-153` - 脚本生成代码位置

  **Acceptance Criteria**:
  - [ ] 脚本文件路径包含 /script/ 子目录

  **QA Scenarios**:

  ```
  Scenario: 验证脚本路径包含 script 目录
    Tool: Bash
    Preconditions: 无
    Steps:
      1. 检查代码中脚本路径包含 'script' 目录
    Expected Result: 路径为 path.join(outputDir, 'script', 'init.xx')
    Evidence: .sisyphus/evidence/task-4-script-path.{ext}
  ```

  **Evidence to Capture**:
  - [ ] grep 输出保存到证据文件

  **Commit**: NO

- [x] 5. 更新 README.md 文档

  **What to do**:
  - 更新 README 中关于默认输出目录的说明
  - 更新 init 命令生成的文件列表
  - 提及脚本文件位置变化

  **Must NOT do**:
  - 不添加未请求的新内容
  - 不修改其他无关部分

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档更新
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6)
  - **Parallel Group**: Wave 1
  - **Blocks**: 无
  - **Blocked By**: 4

  **References**:
  - README.md 现有文档结构

  **Acceptance Criteria**:
  - [ ] README 提及 .agent-harness 作为默认目录

  **QA Scenarios**:

  ```
  Scenario: 验证 README 更新
    Tool: Bash
    Preconditions: 无
    Steps:
      1. grep 检查 README 是否包含 .agent-harness
    Expected Result: 输出显示 .agent-harness 目录说明
    Evidence: .sisyphus/evidence/task-5-readme.{ext}
  ```

  **Evidence to Capture**:
  - [ ] grep 输出保存到证据文件

  **Commit**: NO

- [x] 6. 集成测试验证

  **What to do**:
  - 在临时目录运行 agent-harness init
  - 验证 .agent-harness 目录结构
  - 验证各文件内容正确

  **Must NOT do**:
  - 不修改源代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 测试验证
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - 无

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: 无
  - **Blocked By**: 4

  **Acceptance Criteria**:
  - [ ] .agent-harness/feature_list.json 存在
  - [ ] .agent-harness/progress.md 存在
  - [ ] .agent-harness/script/init.sh 存在
  - [ ] .agent-harness/script/init.bat 存在
  - [ ] .agent-harness/script/init.ps1 存在
  - [ ] .agent-harness/project.md 存在（由 scan 生成）
  - [ ] project.md 包含真实技术栈（不是空模板）

  **QA Scenarios**:

  ```
  Scenario: 完整 init + scan 流程测试
    Tool: Bash
    Preconditions: 已构建项目
    Steps:
      1. 创建临时目录并进入
      2. 运行 agent-harness init
      3. 检查 .agent-harness 目录结构
      4. 检查各文件内容
    Expected Result: 所有文件存在且内容正确
    Evidence: .sisyphus/evidence/task-6-integration.{ext}

  Scenario: scan 命令独立运行测试
    Tool: Bash
    Preconditions: 已运行 init
    Steps:
      1. 运行 agent-harness scan
      2. 验证 project.md 被更新
    Expected Result: scan 命令正常工作
    Evidence: .sisyphus/evidence/task-6-scan-standalone.{ext}
  ```

  **Evidence to Capture**:
  - [ ] 目录结构输出
  - [ ] 文件内容片段

  **Commit**: NO

---

## Final Verification Wave (MANDATORY - after ALL implementation tasks)

> 2 个审查 agent 并行运行。全部必须批准。拒绝 → 修复 → 重新运行。

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Integration Test** — `quick`
  运行完整的 init + scan 流程，验证所有功能正常工作。
  Output: `Init [PASS/FAIL] | Scan [PASS/FAIL] | Files [N/N exist] | VERDICT`

---

## Commit Strategy

- **1**: 合并所有修改为一次提交
  - Message: `feat: default output to .agent-harness and auto-scan after init`
  - Files: `src/index.ts`, `README.md`

---

## Success Criteria

### Verification Commands
```bash
# 测试 init 命令
cd /tmp/test-project && agent-harness init
ls -la .agent-harness/
cat .agent-harness/feature_list.json
cat .agent-harness/project.md

# 测试 scan 单独运行
agent-harness scan
```

### Final Checklist
- [ ] 所有 "Must Have" 都已实现
- [ ] 所有 "Must NOT Have" 都已避免
- [ ] README 已更新
- [ ] 集成测试通过
