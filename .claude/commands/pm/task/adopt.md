# /pm:task:adopt - Associate events to task (V3.7)

将未关联的事件后关联到指定任务。

## 用法

```bash
# 交互式关联
/pm:task:adopt <task_id>

# 自动确认
/pm:task:adopt <task_id> --yes
```

## AI 会做什么

1. 运行 `pm task adopt <id>`
2. 查找所有未关联的事件（`task_id: null`）
3. 分析最近的 commits
4. 预览将要关联的工作
5. 确认后更新事件
6. 重建索引

## 输出示例

```
🔍 Finding unassociated events...

Found 5 unassociated events:
  1. [file_edit] backend/email/sync.py
  2. [file_edit] backend/email/queue.py
  3. [command] pytest tests/
  4. [commit] fix: 修复邮件同步超时
  5. [commit] test: 添加同步测试

Recent commits (will also be associated):
  - fix: 修复邮件同步超时
  - test: 添加同步测试

Associate 5 events + 2 commits to task #123? (y/N): y

✅ Associated 7 items with task #123

🔄 Rebuilding index...
  ✅ Index updated
```

## 使用场景

### 1. 忘记启动任务
```bash
# 直接开始工作（忘记 pm task start）
# ... 工作一段时间 ...

# 事后创建任务并关联
pm task create "修复邮件同步"  # → Task #123
/pm:task:adopt 123 --yes
```

### 2. 探索性工作转正式任务
```bash
# 探索性修改
# ... 发现需要正式跟踪 ...

pm task create "优化邮件性能"
/pm:task:adopt 124
```

## 智能推断

即使不使用 adopt，索引系统也会尝试推断关联：

1. **从 commit 消息**：`fix #123`, `Task #123`
2. **从分支名**：`task/123-xxx`
3. **从事件标题**：包含 `#123`

## 索引重建

adopt 后会自动重建索引：
- 缓存失效
- 重新扫描所有事件
- 应用推断策略

## 相关命令

- `/pm:task:start` - 启动任务（自动关联）
- `/pm/review` - 查看未关联事件
