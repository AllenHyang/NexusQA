# /pm:task:pause - Pause task with Git stash (V3.7)

暂停当前任务，使用 Git stash 保存未提交的工作。

## 用法

```bash
/pm:task:pause
```

## AI 会做什么

1. 运行 `pm task pause`
2. 使用 `git stash push -u` 保存未提交的变更（包括 untracked 文件）
3. 更新任务状态为 `paused`
4. 清除活动任务上下文
5. 清理工作区

## 输出示例

```
💾 Stashing uncommitted changes...

⏸️  Paused task #123: 修复邮件同步超时
   Changes saved to: WIP: task 123

Working directory is now clean.
```

## Git Stash 说明

Stash 消息格式：`WIP: task <id> - <title>`

可以查看 stash：
```bash
git stash list
# stash@{0}: On main: WIP: task 123 - 修复邮件同步超时
```

## 恢复工作

使用 `/pm:task:resume <id>` 恢复：
- 自动切换回任务分支
- 自动恢复 stash 的变更
- 继续工作

## 使用场景

1. **紧急切换到 hotfix**
   - Hotfix 会自动调用 pause
   - 保存当前工作状态
   - 切换到 hotfix 分支

2. **切换到其他任务**
   - 手动 pause 当前任务
   - 启动新任务

3. **临时中断**
   - 需要处理其他事情
   - 保存工作进度

## 相关命令

- `/pm:task:resume` - 恢复暂停的任务
- `/pm:hotfix:create` - 创建 hotfix（会自动 pause）
