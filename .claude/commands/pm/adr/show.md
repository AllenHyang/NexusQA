# /pm:adr:show - Show Architecture Decision Record

查看特定架构决策记录（ADR）的详细内容。

## 用法

```bash
# 查看指定编号的 ADR
/pm:adr:show 1
/pm:adr:show 0001

# 查看最新的 ADR
/pm:adr:show latest
```

## 参数

- `number` - ADR 编号（支持 1 或 0001 格式）
- `latest` - 特殊关键字，查看最新创建的 ADR

## AI 会做什么

1. 根据编号查找对应的 ADR 文件
2. 读取并解析 ADR 内容
3. 格式化显示所有章节
4. 高亮关键信息（状态、日期、决策者）
5. 提供相关操作建议

## 输出示例

### 示例 1：查看 ADR 详情

```
用户：/pm:adr:show 1

输出：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ADR-0001: 选择 PostgreSQL 作为主数据库
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Status: ✅ accepted
📅 Date: 2025-11-01
👥 Deciders: 架构团队
📄 File: .project-log/decisions/0001-choose-postgresql-as-main-database.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Context

我们需要为多账户邮件管理系统选择一个关系型数据库。系统需要：
- 存储用户账户、邮件元数据、文件夹结构
- 支持复杂查询和全文搜索
- 处理高并发读写操作
- 保证数据一致性和事务支持

当前团队更熟悉 SQL，并且需要 ACID 特性。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Decision

选择 PostgreSQL 作为主数据库，理由：

1. **功能完整**：完整的 ACID 支持，成熟的全文搜索
2. **性能优秀**：通过索引和查询优化可满足性能需求
3. **JSON 支持**：原生 JSONB 类型适合存储邮件元数据
4. **扩展性好**：支持分区、复制、PostGIS 等扩展
5. **开源免费**：无许可证成本，社区活跃

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Alternatives Considered

### MySQL
- Pros: 团队熟悉，性能好
- Cons: JSON 支持较弱，全文搜索功能有限
- Why rejected: 功能不够完整

### MongoDB
- Pros: 灵活的文档模型
- Cons: 缺少 ACID 保证，团队不熟悉
- Why rejected: 不满足事务需求

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Consequences

### Positive
- 完整的 ACID 支持保证数据一致性
- 强大的查询功能提升开发效率
- JSON 支持简化了邮件元数据存储

### Negative
- 需要学习 PostgreSQL 特有的优化技巧
- 运维复杂度略高于 MySQL

### Neutral
- 需要配置连接池和查询优化
- 考虑使用 pgBouncer 作为连接池

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Implementation Notes

- 使用 TypeORM 作为 ORM 框架
- 配置连接池：min=5, max=20
- 启用 JSONB 索引加速元数据查询
- 配置 pg_trgm 扩展支持模糊搜索

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Related Decisions

- ADR-0002: 使用 Redis 作为缓存层（减轻数据库负载）
- Task #45: 设置 PostgreSQL 生产环境

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL vs MySQL Comparison](https://example.com/comparison)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 操作：
  code .project-log/decisions/0001-choose-postgresql-as-main-database.md
    - 编辑此 ADR

  /pm:adr:list
    - 返回 ADR 列表
```

### 示例 2：查看最新 ADR

```
用户：/pm:adr:show latest

输出：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ADR-0003: 采用 GraphQL 替代 REST API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Status: 🟡 proposed
📅 Date: 2025-11-11
👥 Deciders: Team

[... ADR 内容 ...]

💡 这是最新创建的 ADR
```

## 实现方式

```bash
# 查找 ADR 文件
ls .project-log/decisions/ | grep "^${number}"

# 或使用完整文件名
cat .project-log/decisions/0001-choose-postgresql-as-main-database.md
```

## 格式化建议

AI 应该：
1. ✅ 使用分隔线清晰划分章节
2. ✅ 状态使用图标（✅ accepted, 🟡 proposed, ❌ rejected）
3. ✅ 高亮关键信息（状态、日期、决策者）
4. ✅ 保持原始 Markdown 格式
5. ✅ 提供快速操作建议

## 快速操作

查看 ADR 后，AI 可以建议：

```bash
# 编辑 ADR
code .project-log/decisions/XXXX-xxx.md

# 创建相关任务
/pm:task:create "实现 ADR-0001 的决策" --tags "adr,implementation"

# 更新 ADR 状态（手动编辑）
"帮我将 ADR-0001 的状态改为 accepted"

# 查看相关 ADR
/pm:adr:show 2  # 查看关联的 ADR
```

## 错误处理

### ADR 不存在

```
用户：/pm:adr:show 999

输出：
❌ ADR-0999 不存在

💡 可用命令：
  /pm:adr:list - 查看所有 ADR
  /pm:adr:create "..." - 创建新 ADR
```

### decisions 目录不存在

```
输出：
⚠️  .project-log/decisions/ 目录不存在

还没有创建任何 ADR。

💡 创建第一个 ADR：
  /pm:adr:create "你的第一个架构决策"
```

## 相关命令

- `/pm:adr:list` - 列出所有 ADR
- `/pm:adr:create "..."` - 创建新 ADR
- `pm check` - 检查 ADR 质量

---

**版本**: V3.7+
**最后更新**: 2025-11-11
