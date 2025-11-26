# /pm/review - Daily work review (V3.7)

整理所有未处理的工作项，关联到任务并保存到 daily-log。

**每天下班前必须运行！**

## 用法

```
/pm/review
```

## AI 会做什么

1. 运行 `pm review`
2. 显示所有未处理的事件
3. 引导你关联到任务或创建新任务
4. 自动提取 Know-How
5. 保存到 daily-log

## 输出示例

```
📊 今日工作回顾 (2025-11-07)

✅ 已关联事件 (15)
  Task #23: 修复邮件同步 - 8 events
  Task #24: 优化数据库 - 7 events

⚠️  未关联事件 (3)
  1. [修复] 登录页面样式
  2. [优化] Redis 连接池
  3. [调试] WebSocket 断连

💡 Know-How 候选 (2)
  1. Redis 连接池优化方案
  2. WebSocket 重连机制

📝 Daily log 已保存: .project-log/daily-logs/2025-11-07.md
```

## 相关命令

- `/pm:task:adopt` - 关联未关联的事件
