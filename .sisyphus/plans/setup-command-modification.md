# 执行计划：Setup命令改造

## 改动概述

1. **Commands改为必选项** - 不再询问用户，直接安装
2. **AGENTS.md生成到项目根目录** - 从`.agent-harness/AGENTS.md`改为`AGENTS.md`

---

## 改动详细

### 1. 修改 `src/commands/setup.ts`

**改动点**：第29-50行的文件选择逻辑

**当前代码** (第29-50行):
```typescript
const fileAnswers = await (inquirer.prompt as any)([
  {
    type: 'checkbox',
    name: 'files',
    message: 'Which files do you want to create?',
    choices: [
      {
        name: 'AGENTS.md',
        checked: true
      },
      {
        name: 'Commands'
      }
    ],
    validate: (answer: string[]) => {
      if (answer.length === 0) {
        return 'You must select at least one file.';
      }
      return true;
    }
  }
]);
```

**改为**: 直接设置Commands为必选，AGENTS.md可选
```typescript
// Commands是必选项，AGENTS.md可选
const agentsMdAnswer = await (inquirer.prompt as any)([
  {
    type: 'confirm',
    name: 'createAgentsMd',
    message: 'Do you want to create AGENTS.md in project root?',
    default: true
  }
]);

const selectedFiles = agentsMdAnswer.createAgentsMd ? ['AGENTS.md', 'Commands'] : ['Commands'];
```

### 2. 修改 `src/utils/fileUtils.ts`

**改动点1**: 第57-60行 `checkAgentsMdExists()`
- 当前：`path.join(process.cwd(), '.agent-harness', 'AGENTS.md')`
- 改为：`path.join(process.cwd(), 'AGENTS.md')`

**改动点2**: 第96-123行 `copyAgentsMdTemplate()`
- 第98行目标路径：`path.join(process.cwd(), '.agent-harness', 'AGENTS.md')`
- 改为：`path.join(process.cwd(), 'AGENTS.md')`

---

## 改动文件清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| src/commands/setup.ts | 修改 | 文件选择逻辑，Commands必选 |
| src/utils/fileUtils.ts | 修改 | AGENTS.md目标路径改为根目录 |

---

## 验证步骤

1. 编译项目：`npm run build`
2. 运行setup命令测试：`node dist/index.js setup`
3. 确认AGENTS.md生成到项目根目录
4. 确认Commands被正确安装

---

## 最小改动原则

- 仅修改必要的2个文件
- 每个文件只改动的关键行
- 不改变现有功能和错误处理逻辑
- 保持向后兼容
