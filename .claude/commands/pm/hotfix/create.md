# /pm:hotfix:create - Create emergency hotfix (V3.7)

创建紧急修复任务，自动暂停当前任务并从 main 创建分支。

## 用法

```bash
/pm:hotfix:create "修复登录崩溃" --severity critical
/pm:hotfix:create "修复支付bug" --severity high
```

## Severity 级别

- `critical` - 严重：影响核心功能
- `high` - 高：影响重要功能
- `medium` - 中：影响次要功能

## AI 会做什么

1. 运行 `pm hotfix create "<title>" --severity <level>`
2. 检测是否有活动任务
3. **自动暂停当前任务**（使用 Git stash）
4. 创建 hotfix 任务（优先级 `urgent`，标签 `hotfix`）
5. 切换到 main 分支
6. 创建 hotfix 分支：`hotfix/<id>-<title>`
7. 启动 hotfix 任务

## 输出示例

### 有活动任务时
```
⚠️  Task #123 is currently active
   Hotfix will automatically pause this task

💾 Stashing uncommitted changes...
⏸️  Paused task #123: 修复邮件同步超时

📋 Created hotfix task #126
   Priority: urgent
   Tags: [hotfix, critical]

🌿 Switching to main branch...
🌿 Creating branch: hotfix/126-修复登录崩溃

🚀 Started hotfix #126
```

### 无活动任务时
```
📋 Created hotfix task #126
   Priority: urgent
   Tags: [hotfix, critical]

🌿 Switching to main branch...
🌿 Creating branch: hotfix/126-修复登录崩溃

🚀 Started hotfix #126
```

## Hotfix 工作流

```bash
# 1. 创建 hotfix（自动暂停当前任务）
/pm:hotfix:create "修复登录bug" --severity critical

# 2. 修复 bug
# ... 编码 ...
git add .
git commit -m "fix: 修复登录验证"

# 3. 完成 hotfix（自动合并到 main + 创建 tag）
/pm:hotfix:done

# 4. 恢复原任务
/pm:task:resume 123
```

## 为什么从 main 创建？

Hotfix 通常需要：
- 基于稳定的生产代码
- 快速合并回 main
- 独立于其他开发工作

## 相关命令

- `/pm:hotfix:done` - 完成 hotfix
- `/pm:task:resume` - 恢复暂停的任务
