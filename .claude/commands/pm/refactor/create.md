# /pm:refactor:create - Create refactor task (V3.7)

创建重构任务，自动运行并保存基准测试。

## 用法

```bash
/pm:refactor:create "重构用户认证模块"
/pm:refactor:create "优化数据库查询" --description "减少 N+1 查询"
```

## AI 会做什么

1. 运行 `pm refactor create "<title>"`
2. 创建 refactor 任务（标签 `refactor`）
3. **运行基准测试**（如果配置）
4. 保存基准数据：
   - 测试覆盖率
   - 代码行数统计
   - 性能指标（如果有）
5. 创建 refactor 分支
6. 启动任务

## 输出示例

```
📋 Creating refactor task: 重构用户认证模块

🧪 Running baseline tests...
  ✅ Tests passed: 145/145
  📊 Coverage: 78.5%
  📏 Lines of code: 2,345

💾 Baseline saved to task metadata

🌿 Creating branch: refactor/127-重构用户认证模块

🚀 Started refactor #127

📝 Baseline data:
   Tests: 145 passed
   Coverage: 78.5%
   LOC: 2,345
   Timestamp: 2025-11-07 10:30:15
```

## 基准测试配置

在 `.pm/config.yaml` 配置测试命令：

```yaml
refactor:
  test_command: "npm test"              # 测试命令
  coverage_command: "npm run coverage"  # 覆盖率命令
  collect_metrics: true                 # 收集指标
```

## 保存的基准数据

```json
{
  "baseline": {
    "timestamp": "2025-11-07T10:30:15",
    "tests": {
      "total": 145,
      "passed": 145,
      "failed": 0
    },
    "coverage": {
      "lines": 78.5,
      "branches": 72.3,
      "functions": 85.1
    },
    "loc": {
      "total": 2345,
      "src": 1890,
      "test": 455
    }
  }
}
```

## 为什么需要基准？

重构的目标是**改善代码而不改变行为**：
- ✅ 测试覆盖率应保持或提升
- ✅ 所有测试必须通过
- ✅ 代码行数通常减少
- ✅ 性能应保持或提升

## 重构工作流

```bash
# 1. 创建 refactor（保存基准）
/pm:refactor:create "重构邮件同步"

# 2. 重构代码
# ... 重构 ...
git add .
git commit -m "refactor: 简化同步逻辑"

# 3. 完成 refactor（自动对比）
/pm:refactor:done
# 会显示前后对比：
#   Coverage: 78.5% → 82.3% (+3.8%) ✅
#   LOC: 2,345 → 2,100 (-245) ✅
```

## 错误场景

### 已有活动任务
```
❌ Task #123 is already active
   Please pause or complete it first before starting a refactor

Hint: pm task pause
```

### 测试失败
```
⚠️  Baseline tests failed
   Continuing anyway, but final validation will be strict

Baseline tests: 142/145 passed
```

## 相关命令

- `/pm:refactor:done` - 完成重构（显示对比）
- `/pm:task:start` - 启动普通任务
