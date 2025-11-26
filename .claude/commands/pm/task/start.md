# /pm:task:start - Start a task with quality gates (V3.7)

启动任务，触发 pre-flight 质量门检查。

## 用法

```bash
# 启动任务
/pm:task:start <task_id>

# 指定分支名
/pm:task:start <task_id> --branch task/123-feature

# 跳过质量门检查（不推荐）
/pm:task:start <task_id> --skip-checks
```

## Pre-flight 质量门检查

启动前会执行两层检查：

### 第一层：Git 环境检查
- ✅ Git 工作区干净（无未提交变更）
- ✅ 无合并冲突
- ✅ 当前在有效分支上
- ✅ 无其他活动任务

### 第二层：任务质量检查 ⭐
- ✅ 任务描述完备性
- ✅ 目的清晰度
- ✅ 验收标准明确性
- ✅ 符合项目规则
- ✅ 考虑最新关注点

## AI 会做什么

1. 加载任务信息（从 `.project-log/tasks/tasks.json`）
2. **执行任务质量检查**：
   - 读取 `~/.claude/skills/project-manager/prompts/task-quality-gate.md`
   - 读取 `.task-context.md` 和 `.pm/task-rules.yaml`
   - 智能分析任务质量（6 个维度评分）
   - 生成详细的质量报告
3. 如果质量检查未通过（< 40 分），给出改进建议和选项
4. 如果通过检查，执行 Git 环境检查
5. 运行 `pm task start <id>`
6. 创建任务分支（自动命名：`task/<id>-<title>`）
7. 设置任务上下文
8. 更新任务状态为 `in-progress`
9. 后续所有工作自动关联到此任务

## 输出示例

```
🔍 Running pre-flight checks...
  ✅ Git working directory is clean
  ✅ No merge conflicts
  ✅ On branch: main

📋 Starting task #123: 修复邮件同步超时

🌿 Creating branch: task/123-修复邮件同步超时

🚀 Started working on task #123
   All future events will be associated with this task.
```

## 错误场景

### 有未提交变更
```
❌ Pre-flight checks failed

💡 You have uncommitted changes. Choose one option:

   Option 1: Commit your changes
   git add .
   git commit -m "your message"
   pm task start 123

   Option 2: Stash your changes
   git stash push -m "WIP: temporary work"
   pm task start 123

   Option 3: Force start (not recommended)
   pm task start 123 --skip-checks
```

**建议**：
- 如果变更和新任务相关 → 提交它们
- 如果变更是临时的 → Stash 它们
- 如果变更属于其他任务 → 先完成那个任务

### 已有活动任务
```
❌ Task #125 is already active
   Please pause or complete it first

Available commands:
  pm task pause     - Pause current task
  pm task done      - Complete current task
```

## 自然语言快捷方式

用户可以用自然语言启动任务：

**示例**：
- 用户："开始任务 1"
  → AI 执行：`pm task start 1`

- 用户："启动任务 123"
  → AI 执行：`pm task start 123`

- 用户："开工任务 5"
  → AI 执行：`pm task start 5`

**识别模式**：
- "开始" / "启动" / "开工" / "开始做" → `pm task start`

## 相关命令

- `/pm:task:pause` - 暂停当前任务
- `/pm:task:resume` - 恢复暂停的任务
- `/pm:task:done` - 完成任务
