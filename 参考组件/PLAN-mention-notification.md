# @用户提及 + 收件箱通知功能实现方案

## 功能需求
1. 在评论输入框中输入 `@` 时，自动弹出用户选择列表
2. 选择用户后，在评论中插入 `@用户名`
3. 被@的用户收到通知提示
4. 用户可以在收件箱中查看所有通知

## 实现步骤

### 第一阶段：数据库模型

**1. 添加 Notification 模型到 prisma/schema.prisma**

```prisma
model Notification {
  id          String    @id @default(cuid())
  type        String    // MENTION, COMMENT_REPLY, etc.
  content     String    // 通知内容摘要

  // 关联的实体
  entityType  String    // REQUIREMENT_COMMENT, DEFECT_COMMENT
  entityId    String    // 评论ID

  // 关联的需求（可选，用于快速导航）
  requirementId String?

  // 接收者
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 发送者
  senderId    String
  sender      User      @relation("SentNotifications", fields: [senderId], references: [id])

  // 状态
  isRead      Boolean   @default(false)
  readAt      DateTime?

  createdAt   DateTime  @default(now())
}
```

**2. 更新 User 模型关系**

```prisma
model User {
  // ... existing fields
  notifications     Notification[]
  sentNotifications Notification[] @relation("SentNotifications")
}
```

### 第二阶段：API 路由

**1. GET /api/notifications**
- 获取当前用户的通知列表
- 支持分页
- 支持筛选已读/未读

**2. PUT /api/notifications/[id]**
- 标记通知为已读

**3. PUT /api/notifications/read-all**
- 标记所有通知为已读

**4. GET /api/notifications/unread-count**
- 获取未读通知数量（用于显示红点）

**5. 修改评论创建 API**
- 解析评论内容中的 @mentions
- 为被@的用户创建通知

### 第三阶段：前端组件

**1. MentionInput 组件** (`components/MentionInput.tsx`)
- 监听 `@` 字符输入
- 弹出用户选择浮层
- 支持键盘导航（上下箭头、Enter选择、Esc关闭）
- 搜索过滤用户列表
- 插入 `@用户名` 到输入框

**2. NotificationBell 组件** (`components/NotificationBell.tsx`)
- 显示在页面顶部/侧边栏
- 显示未读数量红点
- 点击展开通知下拉列表

**3. NotificationDropdown 组件** (`components/NotificationDropdown.tsx`)
- 显示最近通知列表
- 点击通知跳转到对应内容
- 标记已读功能

**4. 更新 CommentsTab 组件**
- 集成 MentionInput
- 渲染评论时高亮 @mentions

### 第四阶段：集成位置

**1. MentionInput 集成到 CommentsTab**
- 替换原有的 textarea
- 保持现有功能不变

**2. NotificationBell 集成到 MainLayout**
- 在侧边栏顶部或用户区域添加通知铃铛

## 文件变更清单

| 文件 | 操作 | 描述 |
|------|------|------|
| prisma/schema.prisma | 修改 | 添加 Notification 模型 |
| app/api/notifications/route.ts | 新增 | 通知列表API |
| app/api/notifications/[id]/route.ts | 新增 | 单个通知操作API |
| app/api/notifications/read-all/route.ts | 新增 | 全部已读API |
| app/api/notifications/unread-count/route.ts | 新增 | 未读数量API |
| app/api/requirements/[requirementId]/comments/route.ts | 修改 | 创建评论时解析mentions |
| components/MentionInput.tsx | 新增 | @提及输入组件 |
| components/NotificationBell.tsx | 新增 | 通知铃铛组件 |
| components/NotificationDropdown.tsx | 新增 | 通知下拉组件 |
| components/Requirement/CommentsTab.tsx | 修改 | 集成MentionInput |
| layouts/MainLayout.tsx | 修改 | 添加NotificationBell |
| types/index.ts | 修改 | 添加Notification类型 |

## 技术要点

### @Mention 解析正则
```typescript
const MENTION_REGEX = /@(\w+)/g;
```

### 用户列表弹出定位
使用 `getBoundingClientRect()` 和绝对定位，确保弹出框在光标附近

### 未读数轮询/实时更新
- 方案A：定时轮询（简单，每30秒查询一次）
- 方案B：WebSocket 实时推送（复杂，需要额外基础设施）

建议先用方案A，后续可升级。

## 预估工作量

1. 数据库模型 + 迁移: 15分钟
2. API 路由: 30分钟
3. MentionInput 组件: 45分钟
4. NotificationBell + Dropdown: 30分钟
5. 集成 + 测试: 30分钟

**总计: 约 2.5 小时**
