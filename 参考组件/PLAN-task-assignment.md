# 任务分配功能实现计划

## 目标
实现三个缺失的任务分配功能的完整 UI：
1. TestCase assignedTo (测试用例执行人)
2. Requirement ownerId (需求负责人)
3. Requirement reviewerId (需求审阅人)

---

## 功能1: TestCase assignedTo UI

### 现状分析
- ✅ 数据模型: `TestCase.assignedToId` 已存在 (schema.prisma:55-56)
- ✅ API: `/api/testcases` POST 已支持 `assignedToId` (route.ts:111)
- ❌ UI: `TestCaseForm.tsx` 缺少用户选择器

### 实现步骤

#### Step 1.1: 修改 TestCaseForm 组件
**文件**: `components/TestCase/TestCaseForm.tsx`

添加 `users` prop 和分配人选择器：
```tsx
interface TestCaseFormProps {
  // ... 现有 props
  users: User[];  // 新增
}

// 在 Metadata 区域添加分配人选择器
<div className="glass-input p-5 rounded-2xl border border-zinc-200 shadow-sm">
  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
    <UserIcon className="w-3.5 h-3.5 mr-1.5" /> Assignee
  </label>
  <select
    value={editCase.assignedToId || ""}
    onChange={e => setEditCase({ ...editCase, assignedToId: e.target.value || undefined })}
    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold"
  >
    <option value="">Unassigned</option>
    {users.map(user => (
      <option key={user.id} value={user.id}>{user.name || user.email}</option>
    ))}
  </select>
</div>
```

#### Step 1.2: 修改 TestCaseModal 传递 users
**文件**: `components/TestCaseModal.tsx`

```tsx
interface TestCaseModalProps {
  // ... 现有 props
  users: User[];  // 新增
}

// 传递给 TestCaseForm
<TestCaseForm
  // ... 现有 props
  users={users}
/>
```

#### Step 1.3: 修改调用方传递 users
**文件**: `views/ProjectDetailView.tsx` (或其他使用 TestCaseModal 的地方)

从 useAppStore 获取 users 并传递给 TestCaseModal。

---

## 功能2: Requirement ownerId 编辑器

### 现状分析
- ✅ 数据模型: `InternalRequirement.ownerId` 已存在 (schema.prisma:292)
- ✅ API: `/api/requirements` POST 已支持 `ownerId` (route.ts:87)
- ✅ 状态管理: `RequirementModal` 已有 `ownerId` 状态 (line 99)
- ⚠️ UI: `BasicInfoTab.tsx` 只读显示 ownerId，缺少编辑模式选择器

### 实现步骤

#### Step 2.1: 扩展 BasicInfoTab Props
**文件**: `components/Requirement/BasicInfoTab.tsx`

```tsx
interface BasicInfoTabProps extends TabProps {
  // ... 现有 props
  users: User[];  // 新增
}
```

#### Step 2.2: 添加 ownerId 编辑器
在编辑模式部分添加负责人选择器：

```tsx
{/* Owner Selection - 在 Target Version & Effort 下方 */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
      <UserIcon className="w-3.5 h-3.5 mr-1.5 inline" /> 负责人
    </label>
    <select
      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
      value={formState.ownerId}
      onChange={(e) => formActions.setOwnerId(e.target.value)}
    >
      <option value="">未分配</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>{user.name || user.email}</option>
      ))}
    </select>
  </div>
</div>
```

#### Step 2.3: 修改视图模式显示
将 ownerId 显示为用户名而非 ID：

```tsx
<p className="text-sm text-zinc-900">
  {users.find(u => u.id === formState.ownerId)?.name || formState.ownerId || "-"}
</p>
```

#### Step 2.4: 修改 RequirementModal 传递 users
**文件**: `components/RequirementModal.tsx`

从 useAppStore 获取 users 并传递给 BasicInfoTab。

---

## 功能3: Requirement reviewerId

### 现状分析
- ✅ 数据模型: `InternalRequirement.reviewerId` 已存在 (schema.prisma:315)
- ❌ API: 需要在更新接口添加 reviewerId 支持
- ❌ 状态管理: RequirementModal 缺少 reviewerId 状态
- ❌ UI: 完全没有 reviewerId 相关 UI

### 实现步骤

#### Step 3.1: 更新 API 接口
**文件**: `app/api/requirements/route.ts`

在 POST 接口的 update 部分添加 reviewerId：
```ts
data: {
  // ... 现有字段
  reviewerId: body.reviewerId,
}
```

在 create 部分也添加：
```ts
data: {
  // ... 现有字段
  reviewerId: body.reviewerId || null,
}
```

#### Step 3.2: 更新 types.ts 接口
**文件**: `components/Requirement/types.ts`

```ts
export interface RequirementFormState {
  // ... 现有字段
  reviewerId: string;  // 新增
}

export interface RequirementFormActions {
  // ... 现有字段
  setReviewerId: (value: string) => void;  // 新增
}
```

#### Step 3.3: 更新 RequirementModal 状态
**文件**: `components/RequirementModal.tsx`

```tsx
// 添加 reviewerId 状态
const [reviewerId, setReviewerId] = useState("");

// 初始化时加载
useEffect(() => {
  if (requirement) {
    setReviewerId(requirement.reviewerId || "");
  }
}, [requirement]);

// handleSubmit 时包含 reviewerId
const data = {
  // ... 现有字段
  reviewerId: reviewerId || null,
};

// formState 和 formActions 中添加
const formState = {
  // ... 现有字段
  reviewerId,
};

const formActions = {
  // ... 现有字段
  setReviewerId,
};
```

#### Step 3.4: 在 ReviewTab 添加 reviewerId 选择器
**文件**: `components/Requirement/ReviewTab.tsx`

在提交评审之前，允许选择评审人：
```tsx
<div className="mb-4">
  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
    指定评审人
  </label>
  <select
    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white"
    value={formState.reviewerId}
    onChange={(e) => formActions.setReviewerId(e.target.value)}
  >
    <option value="">未指定</option>
    {users.filter(u => u.role === 'QA_LEAD' || u.role === 'ADMIN').map(user => (
      <option key={user.id} value={user.id}>{user.name || user.email}</option>
    ))}
  </select>
</div>
```

#### Step 3.5: 在 BasicInfoTab 视图模式显示 reviewerId
```tsx
<div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
  <div className="flex items-center gap-2 mb-2">
    <UserCheck className="w-4 h-4 text-zinc-400" />
    <span className="text-xs font-bold text-zinc-500 uppercase">评审人</span>
  </div>
  <p className="text-sm text-zinc-900">
    {users.find(u => u.id === requirement?.reviewerId)?.name || "-"}
  </p>
</div>
```

---

## 文件修改清单

| 文件 | 功能1 | 功能2 | 功能3 | 修改类型 |
|------|:-----:|:-----:|:-----:|----------|
| `components/TestCase/TestCaseForm.tsx` | ✅ | - | - | 添加 users prop 和选择器 |
| `components/TestCaseModal.tsx` | ✅ | - | - | 添加 users prop |
| `views/ProjectDetailView.tsx` | ✅ | - | - | 传递 users 到 Modal |
| `components/Requirement/BasicInfoTab.tsx` | - | ✅ | ✅ | 添加 ownerId 编辑器和 reviewerId 显示 |
| `components/Requirement/ReviewTab.tsx` | - | - | ✅ | 添加 reviewerId 选择器 |
| `components/Requirement/types.ts` | - | - | ✅ | 添加 reviewerId 到接口 |
| `components/RequirementModal.tsx` | - | ✅ | ✅ | 传递 users，添加 reviewerId 状态 |
| `app/api/requirements/route.ts` | - | - | ✅ | 添加 reviewerId 字段支持 |

---

## 执行顺序

1. **Phase 1**: TestCase assignedTo (最简单，依赖最少)
2. **Phase 2**: Requirement ownerId (API 已支持，只需 UI)
3. **Phase 3**: Requirement reviewerId (需要完整实现)

---

## 预估影响

- 无数据库迁移需求 (所有字段已在 schema 中定义)
- 无破坏性变更 (所有新增字段都有默认值或可为 null)
- UI 风格遵循现有 DefectModal 的 assignee 选择器设计

---

## 验收标准

1. ✅ TestCase 编辑界面可选择/更改执行人
2. ✅ Requirement 编辑界面可选择/更改负责人
3. ✅ Requirement 评审界面可指定评审人
4. ✅ 所有选择器显示用户名而非 ID
5. ✅ 保存后数据正确持久化
