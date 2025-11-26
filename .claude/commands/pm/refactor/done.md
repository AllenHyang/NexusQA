# /pm:refactor:done - Complete refactor (V3.7)

完成重构任务，运行最终测试并显示前后对比。

## 用法

```bash
# 完成 refactor（推荐）
/pm:refactor:done

# 跳过测试（不推荐）
/pm:refactor:done --skip-tests
```

## 严格验证

Refactor 要求：
- ✅ **必须**提交所有变更
- ✅ **必须**通过所有测试
- ✅ 测试覆盖率不能降低

## AI 会做什么

1. 运行 `pm refactor done`
2. 验证任务是 refactor 类型
3. 运行最终测试
4. 收集当前指标
5. **对比基准数据**
6. 显示改进报告
7. 合并到 main（如果在分支上）
8. 更新任务状态
9. 保存对比数据到任务

## 输出示例

```
🔍 Running final validation...
  ✅ All changes are committed

🧪 Running final tests...
  ✅ Tests passed: 148/148

📊 Collecting current metrics...

📈 Refactor Results:

Tests:
  Before: 145 passed
  After:  148 passed (+3) ✅

Coverage:
  Lines:     78.5% → 82.3% (+3.8%) ✅
  Branches:  72.3% → 76.1% (+3.8%) ✅
  Functions: 85.1% → 87.2% (+2.1%) ✅

Lines of Code:
  Total: 2,345 → 2,100 (-245 lines, -10.4%) ✅
  Src:   1,890 → 1,650 (-240 lines)
  Test:    455 →   450 (-5 lines)

📦 Merging refactor/127-重构用户认证模块 to main...
  ✅ Merged to main

✅ Completed refactor #127: 重构用户认证模块

💡 Summary:
   - 3 more tests ✅
   - Coverage improved by 3.8% ✅
   - Reduced code by 245 lines ✅
   - All validations passed ✅
```

## 对比指标

### 测试
- 数量变化
- 通过率
- 新增测试

### 覆盖率
- 行覆盖
- 分支覆盖
- 函数覆盖

### 代码量
- 总行数
- 源代码行数
- 测试代码行数
- 减少百分比

## 成功的重构标准

✅ **优秀重构**：
- 测试全部通过
- 覆盖率提升
- 代码行数减少
- 性能保持或提升

⚠️ **需要关注**：
- 覆盖率下降
- 代码行数增加
- 测试失败

❌ **不合格**：
- 测试失败
- 覆盖率大幅下降

## 错误场景

### 测试失败
```
❌ Final tests failed:
   145/148 tests passed (3 failed)

Failed tests:
  - test/auth/login.test.js
  - test/auth/token.test.js

Refactoring cannot be completed with failing tests.
Please fix the tests first.
```

### 覆盖率下降
```
⚠️  Warning: Coverage decreased
   Lines: 78.5% → 75.2% (-3.3%)

This suggests missing test coverage for refactored code.
Consider adding tests before completing.

Continue anyway? (y/N):
```

### 任务不是 refactor
```
❌ Task #123 is not a refactor task
   Use 'pm task done' instead
```

## 完整工作流示例

```bash
# 1. 创建 refactor
/pm:refactor:create "重构邮件队列"
# Baseline: 145 tests, 78.5% coverage, 2,345 LOC

# 2. 重构代码
# ... 提取函数，简化逻辑 ...
git add .
git commit -m "refactor: 提取队列处理函数"

# ... 继续重构 ...
git add .
git commit -m "refactor: 使用策略模式"

# 3. 添加测试
# ... 补充测试 ...
git add .
git commit -m "test: 添加队列策略测试"

# 4. 完成 refactor
/pm:refactor:done
# After: 148 tests (+3), 82.3% coverage (+3.8%), 2,100 LOC (-245)

# 5. 查看任务详情
pm task show 127
# 包含完整的前后对比数据
```

## 保存的对比数据

完成后会保存到任务元数据：

```json
{
  "refactor_comparison": {
    "baseline": { ... },
    "final": { ... },
    "diff": {
      "tests": +3,
      "coverage_delta": +3.8,
      "loc_delta": -245,
      "loc_percent": -10.4
    }
  }
}
```

## 相关命令

- `/pm:refactor:create` - 创建重构任务
- `/pm:task:show` - 查看对比数据
