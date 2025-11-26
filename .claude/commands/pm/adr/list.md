# /pm:adr:list - List Architecture Decision Records

列出项目中的所有架构决策记录（ADR）。

## 用法

```bash
# 列出所有 ADR
/pm:adr:list

# 按状态筛选
/pm:adr:list --status accepted
/pm:adr:list --status proposed
```

## AI 会做什么

1. 读取 `.project-log/decisions/index.md` 索引文件
2. 或扫描 `.project-log/decisions/` 目录下的所有 ADR 文件
3. 解析 ADR 编号、标题、状态和日期
4. 按编号排序显示
5. 提供快速查看和编辑的建议

## 输出示例

### 示例 1：列出所有 ADR

```
用户：/pm:adr:list

输出：
📋 Architecture Decision Records

.project-log/decisions/ (3 个 ADR)

1. ADR-0001: 选择 PostgreSQL 作为主数据库
   Status: ✅ accepted
   Date: 2025-11-01
   File: 0001-choose-postgresql-as-main-database.md

2. ADR-0002: 使用 Redis 作为缓存层
   Status: 🟡 proposed
   Date: 2025-11-05
   File: 0002-use-redis-as-cache-layer.md

3. ADR-0003: 采用 GraphQL 替代 REST API
   Status: ❌ rejected
   Date: 2025-11-08
   File: 0003-adopt-graphql-instead-of-rest-api.md

💡 命令：
  /pm:adr:show 1        - 查看 ADR-0001 详情
  /pm:adr:create "..."  - 创建新 ADR
```

### 示例 2：按状态筛选

```
用户：/pm:adr:list --status accepted

输出：
📋 Architecture Decision Records (Status: accepted)

1. ADR-0001: 选择 PostgreSQL 作为主数据库
   Status: ✅ accepted
   Date: 2025-11-01

💡 共 1 个已接受的决策
```

## 状态图标

- ✅ `accepted` - 已接受
- 🟡 `proposed` - 待决策
- ❌ `rejected` - 已拒绝
- 🔸 `deprecated` - 已废弃
- 🔄 `superseded` - 已被取代

## 实现方式

### 方式 1：读取索引文件（优先）

```bash
cat .project-log/decisions/index.md
```

索引文件格式：
```markdown
# Architecture Decision Records

## Index

- [ADR-0001](0001-*.md) - Title (status) - Date
- [ADR-0002](0002-*.md) - Title (status) - Date
```

### 方式 2：扫描目录

```bash
ls .project-log/decisions/[0-9]*.md | sort
```

对每个文件读取 frontmatter 或 header 获取元数据。

## 相关命令

- `/pm:adr:show <number>` - 查看特定 ADR 详情
- `/pm:adr:create "..."` - 创建新 ADR
- `pm check` - 检查 ADR 质量

## 筛选选项

```bash
# 按状态筛选
/pm:adr:list --status accepted   # 已接受
/pm:adr:list --status proposed   # 待决策
/pm:adr:list --status rejected   # 已拒绝

# 按日期范围
/pm:adr:list --since 2025-11-01
/pm:adr:list --until 2025-11-30
```

---

**版本**: V3.7+
**最后更新**: 2025-11-11
