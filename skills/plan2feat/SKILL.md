---
name: plan2feat
version: 1.0.1
author: leizhuang
description: Generate `feature_list.json` from Use a development plan file this skill when user wants to convert a planning document (markdown, text, or other format) into a structured feature list that follows the `templates/feature_list_schema.json` format. This skill parses development plans and extracts actionable features with categories, priorities, and steps. Appends to existing `feature_list.json` or creates new file.
---

# Plan to Features Converter

You are an expert at converting development plans into structured feature lists. Your task is to analyze a provided development plan document and append extracted features to a `feature_list.json` file that follows the schema defined in `templates/feature_list_schema.json`.

## When to Use This Skill

- User provides a development plan file and wants to add features to `feature_list.json`
- User mentions "convert plan to features", "extract features from plan"
- User wants to break down a project plan into actionable features
- User needs to add features to an existing `feature_list.json`

## Input Requirements

The user MUST provide:
1. **Plan file path**: Path to the development plan document (markdown, text, etc.)
2. **Output path** (optional): Path to feature_list.json (defaults to `feature_list.json`)

## The Feature List Schema

The output JSON must follow this structure (from `templates/feature_list_schema.json`):

```json
[
  {
    "id": 1,
    "category": "Setup",
    "description": "Human-readable description of the feature",
    "source": "path/to/plan.md",
    "priority": "p0",
    "steps": [
      "1: Do something",
      "2: Do another thing"
    ],
    "passes": false
  }
]
```

### Field Requirements

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier, starting from 1, increment by 1 |
| category | string | Feature category (Setup, Build, Deployment, Testing, Documentation, etc.) |
| description | string | Human-readable feature description |
| source | string | The plan file path this feature was generated from |
| priority | string | Priority level p0 (highest) to p5 (lowest) |
| steps | array | List of actionable sub-steps, minimum 1 item |
| passes | boolean | Completion status (default: false) |

## Processing Steps

### Step 1: Check Existing `feature_list.json`

1. Check if `feature_list.json` exists at the output path
2. If exists, read and parse the existing JSON array
3. Find the maximum existing ID to continue numbering
4. If file doesn't exist, start with empty array and ID = 1

### Step 2: Read the Development Plan

Read the entire plan file provided by the user. Analyze its structure:
- Is it markdown with headers?
- Is it a bullet list?
- Is it a structured document with phases?
- Does it have existing priorities or categories?

### Step 3: Extract Features

Parse the plan and extract discrete features. For each feature:
- Determine appropriate category based on content type
- Create a clear, concise description
- Assign priority based on:
  - p0: Critical path items, prerequisites
  - p1: Core functionality
  - p2: Important features
  - p3: Nice-to-have features
  - p4: Enhancement features
  - p5: Future/low priority items
- Break down into actionable steps

### Step 4: Generate and Append Features

Create new feature objects with proper structure:
- Assign sequential IDs continuing from max existing ID + 1
- Set all passes to false initially
- Use the plan file path as the source

### Step 5: Write to File

Write the merged feature list to:
- User-specified output path, OR
- `feature_list.json` (default)

**IMPORTANT**: Always APPEND to existing features, never overwrite. Merge new features with existing ones.

## Category Guidelines

Use these standard categories (add others as needed):

- **Setup**: Project initialization, environment setup, dependencies
- **Build**: Compilation, bundling, code generation
- **Test**: Unit tests, integration tests, E2E tests
- **Deploy**: Deployment scripts, CI/CD, hosting
- **Documentation**: README, API docs, inline docs
- **Core**: Main application functionality
- **Features**: Specific feature implementations
- **Refactor**: Code improvements, optimizations
- **Security**: Authentication, authorization, data protection

## Priority Assignment

| Priority | When to Use |
|----------|-------------|
| p0 | Prerequisites, critical path, blocking items |
| p1 | Core features without which app is unusable |
| p2 | Important features that enhance usability |
| p3 | Standard features, common functionality |
| p4 | Nice-to-have features, polish |
| p5 | Future considerations, low urgency |

## Output Format

Always output a valid JSON array that:
1. Follows the schema exactly
2. Has no syntax errors
3. Contains all existing features PLUS new features from the plan
4. Has all required fields populated
5. Maintains unique IDs across all features

## Example

User provides: `docs/roadmap.md`
Existing: `feature_list.json` with 3 features (IDs 1-3)
Output: `feature_list.json` with 3 + N features (new IDs 4, 5, ...)

## Error Handling

If the plan file cannot be read:
1. Report the error clearly
2. Ask user to verify the file path
3. Do not modify existing `feature_list.json`

If the plan is empty or cannot be parsed:
1. Inform the user
2. Ask for clarification on plan content
3. Do not modify existing `feature_list.json`

If `feature_list.json` exists but is invalid JSON:
1. Report the error
2. Ask user to fix the file before adding new features
