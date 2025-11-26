# /pm:hotfix:done - Complete hotfix (V3.7)

完成 hotfix，运行严格验证并自动合并到 main + 创建 Git tag。

## 用法

```bash
# 完成 hotfix（推荐）
/pm:hotfix:done

# 跳过测试（不推荐）
/pm:hotfix:done --skip-tests

# 不创建 tag
/pm:hotfix:done --no-tag
```

## 严格验证

Hotfix 比普通任务更严格：
- ✅ **必须**提交所有变更
- ✅ **必须**通过测试（除非 --skip-tests）
- ✅ **必须**在 hotfix 分支上

## AI 会做什么

1. 运行 `pm hotfix done`
2. 验证任务是 hotfix 类型
3. 运行 final validation（严格模式）
4. 切换到 main
5. **合并 hotfix 分支**（`--no-ff`）
6. **创建 Git tag**：`hotfix-<id>`
7. 删除 hotfix 分支
8. 更新任务状态为 `completed`
9. 清除任务上下文

## 输出示例

```
🔍 Running final validation (strict mode)...
  ✅ All changes are committed
  ✅ Tests passed
  ✅ On hotfix branch

📦 Merging hotfix/126-修复登录崩溃 to main...
  ✅ Merged to main

🏷️  Created tag: hotfix-126
   Message: Hotfix #126: 修复登录崩溃

🗑️  Deleted branch: hotfix/126-修复登录崩溃

✅ Completed hotfix #126: 修复登录崩溃

💡 Next steps:
   - Verify the fix in production
   - Resume previous task: pm task resume 123
   - Or start a new task: pm task start <id>
```

## 错误场景

### 未提交变更
```
❌ Final validation failed:
   Working directory has uncommitted changes
   Hotfixes must have all changes committed

Please commit your changes:
  git add .
  git commit -m "fix: ..."
```

### 任务不是 hotfix
```
❌ Task #123 is not a hotfix task
   Use 'pm task done' instead
```

## Git Tag 说明

创建的 tag 格式：
```
Tag: hotfix-<id>
Message: Hotfix #<id>: <title>
```

查看所有 hotfix tags：
```bash
git tag -l "hotfix-*"
```

## 合并策略

使用 `--no-ff` 确保：
- 保留 hotfix 分支历史
- 清晰的合并记录
- 方便回溯

合并提交消息：
```
Merge hotfix #126: 修复登录崩溃
```

## 完整工作流示例

```bash
# 1. 创建 hotfix
/pm:hotfix:create "修复支付异常" --severity critical

# 2. 修复问题
# ... 编码 ...
git add .
git commit -m "fix: 修复支付金额计算"

# 3. 测试
npm test

# 4. 完成 hotfix
/pm:hotfix:done

# 5. 验证结果
git log --oneline -1          # 看到合并提交
git tag -l "hotfix-*"         # 看到新 tag
git branch                    # hotfix 分支已删除

# 6. 恢复原任务
/pm:task:resume 123
```

## 相关命令

- `/pm:hotfix:create` - 创建 hotfix
- `/pm:task:resume` - 恢复任务
