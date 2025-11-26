# /pm:adr:create - Create Architecture Decision Record

创建一个新的架构决策记录（ADR）。

## 用法

```bash
# 创建 ADR（最简）
/pm:adr:create "选择 PostgreSQL 作为主数据库"

# 完整参数
/pm:adr:create "选择 PostgreSQL 作为主数据库" --status accepted --deciders "架构团队"
```

## 参数

- `title` (必需) - ADR 标题，应该简洁描述决策内容
- `--status` - 状态（可选，默认: proposed）
  - `proposed` - 待决策
  - `accepted` - 已接受
  - `rejected` - 已拒绝
  - `deprecated` - 已废弃
  - `superseded` - 已被取代
- `--deciders` - 决策者（可选，默认: Team）

## AI 会做什么

AI 会直接操作文件系统来创建 ADR，无需脚本：

1. **检查现有 ADR**：读取 `.project-log/decisions/` 目录，找到当前最大编号
2. **生成新编号**：自动生成递增的 ADR 编号（0001, 0002, ...）
3. **创建 slug**：将标题转换为 URL 友好的 slug（小写、连字符分隔）
4. **创建 ADR 文件**：`.project-log/decisions/XXXX-<slug>.md`
   - 使用 YAML frontmatter 存储元数据
   - 填充标准 ADR 模板章节
   - 设置状态、日期、决策者等信息
5. **更新索引**：如果存在 `.project-log/decisions/index.md`，自动更新索引
6. **验证格式**：检查 ADR 是否包含所有必需章节
7. **显示结果**：输出创建的文件位置和下一步操作建议

## ADR 标准格式

创建的 ADR 文件包含以下章节：

```markdown
# {number}. {title}

**Status:** {status}
**Date:** {date}
**Deciders:** {deciders}

## Context
[描述导致此决策的问题、约束和背景]

## Decision
[描述做出的决策]

## Alternatives Considered
[列出考虑过的其他方案及优缺点]

## Consequences
[描述此决策的积极、消极和中立影响]

## Implementation Notes
[关键技术细节或迁移步骤]

## Related Decisions
[相关 ADR 或 OpenSpec 提案的链接]

## References
[文档、文章或讨论的链接]
```

## 输出示例

### 示例 1：创建新 ADR

```
用户：/pm:adr:create "选择 Redis 作为缓存层"

AI 操作：
1. 读取 .project-log/decisions/ 目录
2. 发现当前没有 ADR，生成编号 0001
3. 创建文件 0001-choose-redis-as-cache-layer.md
4. 填充 YAML frontmatter 和模板内容

输出：
======================================================================
✅ ADR CREATED
======================================================================

📄 File: .project-log/decisions/0001-choose-redis-as-cache-layer.md
🔢 Number: ADR-0001
📝 Title: 选择 Redis 作为缓存层
📊 Status: proposed
📅 Date: 2025-11-19

Updated: .project-log/decisions/index.md

----------------------------------------------------------------------
NEXT STEPS:

1. Edit the ADR file and fill in all sections:
   .project-log/decisions/0001-choose-redis-as-cache-layer.md

   Required sections:
   - Context: Why this decision is needed
   - Decision: What was decided
   - Alternatives Considered: Other options evaluated
   - Consequences: Positive, negative, and neutral impacts

2. Update status as decision progresses:
   proposed → accepted/rejected

3. Link related decisions and references

======================================================================
```

### 示例 2：创建已接受的 ADR

```
用户：/pm:adr:create "使用 TypeScript 替代 JavaScript" --status accepted --deciders "技术委员会"

AI 操作：
1. 读取现有 ADR，当前最大编号是 0001
2. 生成新编号 0002
3. 创建文件并设置 status=accepted, deciders="技术委员会"

输出：
======================================================================
✅ ADR CREATED
======================================================================

📄 File: .project-log/decisions/0002-use-typescript-instead-of-javascript.md
🔢 Number: ADR-0002
📝 Title: 使用 TypeScript 替代 JavaScript
📊 Status: accepted ✅
👥 Deciders: 技术委员会
📅 Date: 2025-11-19

Updated: .project-log/decisions/index.md

----------------------------------------------------------------------
```

## 文件命名规则

ADR 文件自动命名为：`{number:04d}-{slug}.md`

**示例**：
- "选择 PostgreSQL 作为主数据库" → `0001-choose-postgresql-as-main-database.md`
- "使用 Redis 缓存" → `0002-use-redis-cache.md`
- "Adopt microservices" → `0003-adopt-microservices.md`

编号自动递增，slug 从标题自动生成（小写、连字符分隔）。

## 创建后的工作流程

### 1. 编辑 ADR 内容

```bash
# 方式 1：使用编辑器
code .project-log/decisions/0001-xxx.md

# 方式 2：请 AI 帮助编辑
"帮我编辑 ADR-0001，填充 Context 和 Decision 章节"
```

### 2. 完善各个章节

**Context（背景）**：
- 当前面临的问题或挑战
- 技术约束和限制
- 业务需求和目标

**Decision（决策）**：
- 具体做出的决策是什么
- 为什么选择这个方案
- 关键的技术选型理由

**Alternatives Considered（备选方案）**：
- 列出至少 2-3 个备选方案
- 每个方案的优缺点
- 为什么最终没有选择这些方案

**Consequences（影响）**：
- **Positive（积极）**：带来的好处和改进
- **Negative（消极）**：潜在的问题和成本
- **Neutral（中立）**：其他需要注意的影响

### 3. 更新状态

随着决策进展，更新 ADR 状态：

```bash
# 手动编辑 frontmatter 中的 status 字段
**Status:** proposed → accepted
```

### 4. 关联相关信息

```bash
# 在 Related Decisions 章节添加：
- ADR-0005: 相关的另一个决策
- OpenSpec Change: add-email-sync-feature
- Task #123: 实现此决策的任务

# 在 References 章节添加：
- [PostgreSQL vs MySQL Comparison](https://...)
- [Redis Documentation](https://...)
```

## 最佳实践

### ✅ 推荐的 ADR 标题

- "选择 PostgreSQL 作为主数据库"（明确、具体）
- "使用 GraphQL 替代 REST API"（清晰的技术选型）
- "采用微服务架构"（架构层面的决策）

### ❌ 不推荐的标题

- "数据库"（太笼统）
- "改进性能"（不够具体）
- "修复 bug"（不是架构决策，应该用 Task）

### 何时创建 ADR

**应该创建 ADR**：
- ✅ 重大技术选型（数据库、框架、语言）
- ✅ 架构模式变更（单体→微服务、同步→异步）
- ✅ 安全策略决策（认证方案、加密策略）
- ✅ 性能优化策略（缓存方案、CDN 选择）
- ✅ 影响多个团队的决策

**不需要创建 ADR**：
- ❌ 日常 bug 修复（用 Task）
- ❌ 小的代码重构（用 Task）
- ❌ 配置调整（用 Know-How）
- ❌ 临时解决方案（用 Task）

## ADR vs OpenSpec vs Know-How

| 类型 | 用途 | 格式 | 示例 |
|------|------|------|------|
| **ADR** | 重大架构决策 | 正式、结构化 | "选择 PostgreSQL" |
| **OpenSpec** | 功能/能力规格 | 需求+设计+任务 | "添加邮件同步功能" |
| **Know-How** | 开发经验 | 灵活、实用 | "修复超时问题的经验" |

**选择建议**：
- 架构决策 → **ADR**
- 新功能规格 → **OpenSpec**
- 日常经验 → **Know-How**（自动提取）

## 查看 ADR

```bash
# 查看 ADR 索引
cat .project-log/decisions/index.md

# 查看特定 ADR
cat .project-log/decisions/0001-xxx.md

# 搜索 ADR
grep -r "Redis" .project-log/decisions/
```

## 质量检查

pm skill 会自动检查 ADR 质量：

```bash
# 运行质量检查
pm check

# 检查内容：
# - 必需章节（Context, Decision, Consequences）
# - 章节字数
# - 文档完整性
```

**验证标准**：
- ✅ 包含所有必需章节
- ✅ Context 章节 > 100 字
- ✅ Decision 章节 > 100 字
- ✅ Consequences 章节 > 50 字
- ✅ 至少列出 1 个备选方案

## 自然语言快捷方式

用户可以用自然语言描述意图，AI 会自动创建 ADR：

**示例**：
- 用户："创建一个 ADR：选择 Redis"
  → AI 操作：读取现有 ADR → 生成编号 → 创建文件

- 用户："记录架构决策：使用微服务"
  → AI 操作：解析标题 → 创建 ADR 文件 → 填充模板

- 用户："创建已接受的 ADR：选择 GraphQL"
  → AI 操作：创建 ADR 并设置 status=accepted

**识别模式**：
- "创建 ADR" / "新建 ADR" / "记录架构决策" → 触发 ADR 创建
- "accepted" / "已接受" → 设置 `status: accepted`
- "rejected" / "已拒绝" → 设置 `status: rejected`
- "by XXX" / "决策者 XXX" → 设置 `deciders: XXX`

## 相关命令

- `/pm:review` - 查看今天的工作（包括 ADR）
- `/pm:task:create` - 创建任务（实现 ADR）
- `pm check` - 检查 ADR 质量

## 故障排查

### 问题 1：目录不存在

如果 `.project-log/decisions/` 不存在，脚本会自动创建。

### 问题 2：编号冲突

ADR 编号会自动递增，查找当前最大编号 +1。如果手动创建了 ADR 文件，确保文件名格式为 `XXXX-*.md`。

### 问题 3：模板不存在

脚本使用内嵌模板，即使外部模板文件不存在也能正常工作。

## 示例：完整 ADR 工作流

```bash
# 1. 创建 ADR
用户：创建 ADR：选择 Redis 作为缓存层

# 2. AI 创建文件
AI：已创建 ADR-0001: .project-log/decisions/0001-choose-redis-as-cache-layer.md

# 3. 编辑内容
用户：帮我完善 ADR-0001 的 Context 和 Decision 章节

# 4. AI 分析并编辑
AI：基于项目情况，填充了：
- Context: 当前数据库查询慢，需要缓存层
- Decision: 选择 Redis（性能、功能、社区支持）
- Alternatives: Memcached（功能少）、本地缓存（不适合分布式）

# 5. 更新状态
用户：将 ADR-0001 状态改为 accepted

# 6. 创建实现任务
用户：创建任务：实现 Redis 缓存层
AI：已创建 Task #15，关联到 ADR-0001

# 7. 质量检查
pm check
✅ ADR-0001 格式正确，所有章节完整
```

---

**版本**: V3.7+
**最后更新**: 2025-11-11
