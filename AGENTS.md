# AGENTS.md - Agent Coding Guidelines

Guidelines for AI agents working in this repository.

---

## 1. Build, Lint & Test Commands

### Package Manager
- **npm** is the primary package manager (not yarn/pnpm unless configured)

### Common Commands
```bash
npm install                    # Install dependencies
npm run build                  # Build the project
npm run dev                    # Run development server
npm run lint                   # Run linter (ESLint)
npm run lint:fix               # Linter with auto-fix
npm run typecheck              # TypeScript type checking
npm test                       # Run all tests
npm test -- <test-file-path>   # Run a single test file
npm run test:watch             # Tests in watch mode
npm run test:coverage          # Tests with coverage
npm run format                 # Format code (Prettier)
```

### CI Commands
```bash
npm run ci                     # Full CI pipeline
npm run build && npm run lint && npm test
```

---

## 2. Code Style Guidelines

### General Principles
- Write **clean, readable code** over clever code
- Keep functions small and focused (single responsibility)
- Use meaningful names for variables, functions, and files
- Comment **why**, not **what**
- **Never suppress TypeScript errors** (`as any`, `@ts-ignore`, `@ts-expect-error`)

### TypeScript Guidelines

#### Types
- **Always use explicit types** for function parameters and return values
- Use `interface` for object shapes, `type` for unions/aliases
- Avoid `any` - use `unknown` when type is truly unknown

```typescript
// Good
interface User { id: string; name: string; email: string; }
function getUserById(id: string): Promise<User | null> { ... }

// Avoid
function getUser(id: any): any { ... }
```

#### Naming Conventions
- **Files**: camelCase (`userService.ts`, `authMiddleware.ts`)
- **Interfaces/Types**: PascalCase (`UserResponse`, `ApiError`)
- **Functions**: camelCase, verb-prefixed (`getUserById`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE for compile-time, camelCase for others
- **Classes**: PascalCase (`UserService`, `AuthController`)

### Import Organization
Order imports by type (separate with blank lines):
1. Node.js built-ins (`fs`, `path`, `http`)
2. External libraries (`express`, `lodash`)
3. Internal modules (`../services`, `./utils`)
4. Type imports (`import type { User }`)

```typescript
import fs from 'fs';
import express from 'express';
import { UserService } from '../services/userService';
import type { ApiResponse } from '../types';
```

### Error Handling
- **Always use try/catch** for async operations
- Throw descriptive errors with context
- Use custom error classes for domain errors
- Never leave empty catch blocks

```typescript
class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}
```

### Async/Await
- Handle promise rejections with try/catch
- Prefer sequential await over `.then()` chains
- Use `Promise.all()` for parallel operations

### Formatting
- **2 spaces** indentation, **single quotes** for strings
- **Semicolons** at end of statements, **trailing commas**
- **Max line length**: 100 chars (soft limit: 120)
- Use Prettier - **never manually fight Prettier**

---

## 3. Testing Guidelines

### Test Organization
- Co-locate tests: `userService.ts` → `userService.test.ts`
- Descriptive names: `should return user when valid id provided`
- Follow AAA: **Arrange**, **Act**, **Assert**

### Test Quality
- Test happy path + edge cases + error scenarios
- Mock external dependencies (DB, APIs, file system)
- Keep tests independent - no shared state

```typescript
describe('UserService', () => {
  it('should return user when valid id provided', async () => {
    const mockUser = { id: '1', name: 'John' };
    mockRepository.findById.mockResolvedValue(mockUser);
    const result = await userService.getUserById('1');
    expect(result).toEqual(mockUser);
  });
});
```

---

## 4. Git Conventions

### Commit Messages
- Conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

```bash
git commit -m "feat(auth): add JWT refresh token rotation"
```

### Branch Naming
- `feature/` new features, `fix/` bug fixes, `refactor/` refactoring

---

## 5. Security Guidelines
- **Never commit secrets** - use environment variables
- Validate and sanitize all user input
- Use parameterized queries (prevent SQL injection)
- Keep dependencies updated (`npm audit`)

---

## 6. Project Structure (Recommended)

```
src/
├── config/          # Configuration files
├── controllers/    # HTTP request handlers
├── services/       # Business logic
├── repositories/   # Data access layer
├── middleware/     # Express middleware
├── types/          # TypeScript interfaces/types
├── utils/          # Helper functions
└── index.ts        # Entry point

tests/              # Test files
scripts/            # Build/deploy scripts
```

---

## 7. When in Doubt
- Follow the **principle of least surprise**
- Look at existing code for patterns
- Ask for clarification if unclear
- **Don't guess** - verify before implementing


 # 全局语言规范

1. **强制简体中文**：无论输入或工具返回何种语言，所有交互回复必须始终使用简体中文。
2. **翻译与保留**：工具或系统输出的英文信息需翻译为中文，代码、链接及技术术语保留原文。