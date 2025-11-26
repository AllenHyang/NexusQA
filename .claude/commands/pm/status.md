# /pm/status - 查看当前工作状态

快速查看当前正在进行的任务和今天的活动情况。

**忘记自己在做什么的时候用！**

## 用法

```
/pm/status
```

或简写：

```
/pm:status
```

## AI 会做什么

1. 运行 `pm status`
2. 显示当前 Git 分支
3. 显示正在进行的任务（in-progress）
4. 显示任务关联的分支（如果不同）
5. 显示今天的活动统计

## 输出示例

```
📊 Current Work Status

📌 Branch: `main`

🔄 In Progress (2):

  #42: 修复邮件同步性能问题 ⚠️
         Branch: `feature/fix-sync` (not checked out)

  #45: 重构认证模块

📝 Today's Activity: 16 entries
  ✅ Task Completed: 12
  🐛 Bug Fixed: 4
```

## 适用场景

- 💡 开发中断后，忘记当前在做什么任务
- 💡 切换上下文后，想快速了解当前状态
- 💡 检查是否有遗留的 in-progress 任务
- 💡 查看今天已经完成了多少工作

## 相关命令

- `/pm:review` - 完整的工作回顾（包括 Git commits、Know-How）
- `/pm:task:show <id>` - 查看具体任务详情
