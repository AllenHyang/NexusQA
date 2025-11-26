# /pm:task:list - List tasks

列出任务，支持过滤。

## 用法

```bash
# 列出所有任务
/pm:task:list

# 按状态过滤
/pm:task:list --status in-progress

# 按优先级过滤
/pm:task:list --priority high

# 按标签过滤
/pm:task:list --tags bug,urgent
```

## 过滤参数

- `--status` - 状态：todo, in-progress, paused, done
- `--priority` - 优先级：low, medium, high, urgent
- `--tags` - 标签，逗号分隔

## AI 会做什么

1. 运行 `pm task list [filters]`
2. 读取所有任务文件
3. 应用过滤条件
4. 按优先级和状态排序
5. 显示任务列表

## 输出示例

```
📋 Tasks (3 items):

🔴 #125 [high] 修复登录bug (in-progress)
   Tags: bug, auth
   Started: 2025-11-06

🟡 #123 [medium] 重构用户模块 (paused)
   Tags: refactor
   Paused: 2025-11-05

⚪ #120 [low] 更新文档 (todo)
   Tags: docs
```

## 相关命令

- `/pm:task:show` - 查看任务详情
- `/pm:task:create` - 创建新任务
