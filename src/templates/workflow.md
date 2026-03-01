# 开发工作流规范

> 本文件定义了本项目的开发流程，所有开发必须严格遵循。

## 阶段 0: GET YOUR BEARINGS (强制执行)

每次开始开发前，必须执行以下步骤：

```bash
# 1. 确认工作目录
pwd

# 2. 了解项目结构
ls -la

# 3. 读取项目规格 (关键！)
cat .agent-harness/app_spec.txt

# 4. 读取功能列表
cat feature_list.json | head -50

# 5. 读取进度笔记 (如存在)
cat .agent-harness/progress.txt

# 6. 查看 Git 历史
git log --oneline -20

# 7. 统计剩余未完成测试数
cat feature_list.json | grep '"passes": false' | wc -l
```

## 阶段 1: 选择一个 FEATURE

- **一次只做一个 Feature**
- 从高优先级 (p0 → p1 → p2) 选择第一个 `passes: false` 的 Feature
- 完成该 Feature 的所有步骤后，才进入下一个

## 阶段 2: 实现 FEATURE

实现选定的 Feature：
1. 编写代码
2. 编写单元测试 (覆盖率 ≥ 80%)
3. 覆盖边界条件和多种场景
4. 编写单元测试
5. 测试验证

## 阶段 3: 更新记录

### 3.1 更新 feature_list.json
- **只能修改 `passes` 字段**
- 从 `false` 改为 `true`

### 3.2 更新进度笔记
创建或更新 `.agent-harness/progress.txt`：
请将以下内容更新到 `.agent-harness/progress.txt` 文件中，如果文件 `.agent-harness/progress.txt` 不存在，则创建该文件：
- 本次会话中完成的工作内容
- 完成的测试项
- 发现或解决的问题
- 接下来需要处理的内容
- 目前的完成情况（例如：“200 个测试中 45 个通过”）
格式如下：
```
## YYYY-MM-dd 开发记录

### 本次完成
- Feature #X: [描述]
- 构建: PASS
- 测试: PASS (X tests)

### 发现/解决的问题
- [问题描述和解决方案]

### 待处理
- Feature #Y: [描述]

### 当前状态
X/5 features completed
```

### 3.3 Git 提交
```bash
git add .
git commit -m "[Feature #X] 完成描述

- 变更内容
- 构建: PASS
- 测试: PASS
- 更新 feature_list.json"
```

## 阶段 4: 结束会话

- [ ] 确保所有代码已提交
- [ ] 确保 progress.txt 已更新
- [ ] 确保 feature_list.json 已更新
- [ ] 确保无未提交的更改
- [ ] 确保应用处于可工作状态

---

## 关键规则

| 规则 | 说明 |
|------|------|
| 一次只做 1 个 Feature | 不贪多，完成后再做下一个 |
| 覆盖率 ≥ 80% | 测试必须充分覆盖边界情况 |
| 只修改 passes 字段 | 禁止修改其他字段 |
| 必须更新 progress.txt | 记录是负责任的表现 |
| 先读取再动手 | Step 0 是强制前置条件 |