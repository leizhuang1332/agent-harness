# Plan: Move src/skills → src/templates/skills

## Target Structure

```
src/templates/
├── AGENTS.md           ← 原有的
└── skills/             ← 从 src/skills 移动进来
    ├── app-spec/
    │   └── SKILL.md
    └── plan2feat/
        ├── SKILL.md
        └── templates/
            └── feature_list_schema.json
```

## Files Requiring Changes

### 1. src/utils/installSkills.ts (核心逻辑)

| Line | Current | Change To |
|------|---------|-----------|
| 62 | `path.join(__dirname, '..', 'skills')` | `path.join(__dirname, '..', 'templates', 'skills')` |

**Function:** `getSkillsSourceDir()` - 唯一的目录路径引用

```typescript
// Line 62 - 修改前
return path.join(__dirname, '..', 'skills');

// Line 62 - 修改后
return path.join(__dirname, '..', 'templates', 'skills');
```

### 2. scripts/copy-assets.js (构建脚本)

| 改动 | 说明 |
|------|------|
| **无需改动** | Line 10 已复制 `{ src: 'src/templates', dest: 'dist/templates' }`，移动后 `skills/` 已被包含在内 |

### 3. README.md (文档，可选)

| Line | Current | Change To |
|------|---------|-----------|
| 60 | `├── skills/` | `├── templates/` + indent 层级变化 |

## 移动操作

```bash
# 1. 移动整个 skills 目录到 templates 下
mv src/skills src/templates/skills

# 2. 验证结果
src/templates/
├── AGENTS.md
└── skills/
    ├── app-spec/
    │   └── SKILL.md
    └── plan2feat/
        ├── SKILL.md
        └── templates/
            └── feature_list_schema.json
```

## 函数边界确认

| Function | 改动 | 说明 |
|----------|------|------|
| `getSkillsSourceDir()` | 路径拼接 | 添加 `'templates'` 中间层 |
| `getSkillsList()` | 无需改动 | 调用 `getSkillsSourceDir()`，自动生效 |
| 其他函数 | 无需改动 | 都通过 `getSkillsSourceDir()` 获取路径 |

## 最小改动原则

✅ 仅修改 **1 个源文件** (`installSkills.ts` line 62)
✅ 1 个目录移动操作
✅ 无需修改函数逻辑
✅ copy-assets.js 无需改动 (已被 templates 目录复制覆盖)
✅ README 文档改为可选

## 改动总结

| 文件 | 操作 |
|------|------|
| `src/utils/installSkills.ts` | 修改 line 62 路径 |
| `src/skills/` | 移动到 `src/templates/skills/` |
| `scripts/copy-assets.js` | 无需改动 |
| `README.md` | 可选更新 |
