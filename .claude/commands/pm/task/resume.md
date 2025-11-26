# /pm:task:resume - Resume a paused task (V3.7)

恢复暂停的任务，自动恢复 Git stash 的变更。

## 用法

```bash
/pm:task:resume <task_id>
```

## AI 会做什么

1. 运行 `pm task resume <id>`
2. 验证任务状态为 `paused` 或 `in-progress`
3. 切换回任务分支（如果有）
4. 查找并恢复对应的 Git stash
5. 更新任务状态为 `in-progress`
6. 设置任务上下文

## 输出示例

```
♻️  Restoring stashed changes for task #123...

▶️  Resumed task #123: 修复邮件同步超时
   Branch: task/123-修复邮件同步超时
   Stash restored: WIP: task 123
```

## Git Stash 恢复

自动查找 stash 消息包含 `task <id>` 的 stash 并恢复：
```bash
# 自动执行
git stash list | grep "task 123"
git stash pop stash@{n}
```

## 错误场景

### 任务未暂停
```
⚠️  Task #123 is pending, not paused
   Use 'pm task start 123' to start a new session
```

### 找不到 stash
```
⚠️  No stash found for task #123
   Resuming without restoring changes
```

## 使用场景

1. **完成 hotfix 后恢复**
   ```bash
   pm hotfix done              # 完成 hotfix
   /pm:task:resume 123         # 恢复原任务
   ```

2. **切换回之前的任务**
   ```bash
   pm task pause               # 暂停当前
   /pm:task:resume 120         # 恢复之前的
   ```

## 相关命令

- `/pm:task:pause` - 暂停任务
- `/pm:task:start` - 启动新任务
