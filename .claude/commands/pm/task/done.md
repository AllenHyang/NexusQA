# /pm:task:done - Complete task with validation (V3.7)

完成当前任务，运行 final validation 并自动合并分支到 main。

## 用法

```bash
# 完成任务（推荐）
/pm:task:done

# 跳过质量门检查（不推荐）
/pm:task:done --skip-checks
```

## Final Validation 质量门

完成前会检查：
- ✅ 所有变更已提交（Git 干净）
- ✅ 测试通过（如果配置）
- ⚠️  提示未推送的 commits（警告级别）

## AI 会做什么

1. 运行 `pm task done`
2. 执行 final validation
3. 如果在任务分支上：
   - 切换到 main
   - 合并任务分支（`--no-ff`）
   - 删除任务分支
4. 更新任务状态为 `done`
5. 清除任务上下文
6. 显示统计信息

## 输出示例

### 成功完成（带自动合并）

```
🔍 Running final validation...
  ✅ All changes are committed
  ✅ Tests passed (skipped)
  ⚠️  You have 2 unpushed commit(s)

📦 Merging task/123-修复邮件同步超时 to main...
  ✅ Merged to main

🗑️  Deleted branch: task/123-修复邮件同步超时

✅ Completed task #123: 修复邮件同步超时

📊 Statistics:
   Duration: 3h 25m
   Commits: 5
   Files changed: 12
```

### 在 main 分支完成（无需合并）

```
🔍 Running final validation...
  ✅ All changes are committed

✅ Completed task #124: 快速修复

📊 Statistics:
   Duration: 15m
   Commits: 1
   Files changed: 2
```

## 错误场景

### 有未提交变更
```
❌ Final validation failed:
   Working directory has uncommitted changes
   Please commit all changes before completing the task

Hint: git status
```

**解决方案**：
```bash
git add .
git commit -m "完成功能"
/pm:task:done
```

## 自动分支合并

如果任务在分支上完成，会自动：
1. 切换到 main
2. 使用 `git merge --no-ff` 合并
3. 删除任务分支

合并提交消息格式：
```
Merge task #123: 修复邮件同步超时
```

## 使用场景

1. **标准流程**
   ```bash
   pm task start 123
   # ... 工作 ...
   git commit -m "完成"
   /pm:task:done          # 自动合并 + 删除分支
   ```

2. **在 main 上快速修复**
   ```bash
   pm task start 124
   # ... 快速修改 ...
   git commit -m "fix"
   /pm:task:done          # 不需要合并
   ```

## 相关命令

- `/pm:task:start` - 启动任务
- `/pm:hotfix:done` - 完成 hotfix
- `/pm:refactor:done` - 完成 refactor
