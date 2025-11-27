import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROJECTS = [
  {
    name: 'NexusQA 产品开发',
    description: 'NexusQA 是一款面向中小型研发团队的 AI 驱动测试管理平台，通过智能化用例生成和一体化流程管理，帮助团队提升测试效率。',
    repositoryUrl: 'https://github.com/anthropics/nexusqa',
  },
  {
    name: 'E-Commerce Platform',
    description: 'Main storefront and admin panel for the e-commerce solution.',
    repositoryUrl: 'https://github.com/company/ecommerce-main',
  },
  {
    name: 'Mobile App (iOS/Android)',
    description: 'Consumer facing mobile application.',
    repositoryUrl: 'https://github.com/company/mobile-app',
  },
];

const USERS = [
  {
    id: 'user-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random'
  },
  {
    id: 'user-john',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'TESTER',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  }
];

const SUITES = [
  'Authentication',
  'User Profile',
  'Product Catalog',
  'Checkout Process',
  'Admin Dashboard',
  'API Integration',
  'Performance Tests'
];

// NexusQA 专用测试套件
const NEXUSQA_SUITES = [
  '项目管理',
  '测试用例管理',
  '测试计划管理',
  '测试执行',
  '缺陷管理',
  '需求管理',
  '统计分析',
  '系统管理'
];

// NexusQA 专用测试用例 - 与需求对应
const NEXUSQA_TEST_CASES = [
  // ========== 项目管理 ==========
  { suite: '项目管理', title: 'TC-PM-001 验证创建项目功能', priority: 'P0', status: 'PASSED', reqIndex: 10 },
  { suite: '项目管理', title: 'TC-PM-002 验证项目信息编辑', priority: 'P1', status: 'PASSED', reqIndex: 10 },
  { suite: '项目管理', title: 'TC-PM-003 验证项目成员添加', priority: 'P1', status: 'PASSED', reqIndex: 11 },
  { suite: '项目管理', title: 'TC-PM-004 验证项目成员移除', priority: 'P2', status: 'UNTESTED', reqIndex: 11 },

  // ========== 测试用例管理 ==========
  { suite: '测试用例管理', title: 'TC-TC-001 验证用例创建表单', priority: 'P0', status: 'PASSED', reqIndex: 0 },
  { suite: '测试用例管理', title: 'TC-TC-002 验证 AI 生成测试步骤', priority: 'P0', status: 'PASSED', reqIndex: 0 },
  { suite: '测试用例管理', title: 'TC-TC-003 验证步骤编辑和排序', priority: 'P1', status: 'PASSED', reqIndex: 0 },
  { suite: '测试用例管理', title: 'TC-TC-004 验证用例评审流程', priority: 'P1', status: 'PASSED', reqIndex: 5 },
  { suite: '测试用例管理', title: 'TC-TC-005 验证评审状态变更', priority: 'P1', status: 'PASSED', reqIndex: 5 },
  { suite: '测试用例管理', title: 'TC-TC-006 验证 Excel 用例导入（US-007）', priority: 'P1', status: 'PASSED', reqIndex: 6 },
  { suite: '测试用例管理', title: 'TC-TC-007 验证导入数据校验（US-007）', priority: 'P2', status: 'FAILED', reqIndex: 6 },
  { suite: '测试用例管理', title: 'TC-TC-008 验证 AI 生成步骤功能', priority: 'P0', status: 'PASSED', reqIndex: 12 },
  { suite: '测试用例管理', title: 'TC-TC-009 验证步骤反馈机制', priority: 'P2', status: 'UNTESTED', reqIndex: 12 },
  { suite: '测试用例管理', title: 'TC-TC-010 验证用例评审工作流', priority: 'P1', status: 'PASSED', reqIndex: 13 },
  { suite: '测试用例管理', title: 'TC-TC-011 验证评审意见提交', priority: 'P2', status: 'PASSED', reqIndex: 13 },
  { suite: '测试用例管理', title: 'TC-TC-012 验证 Excel 用例导入功能', priority: 'P1', status: 'UNTESTED', reqIndex: 14 },
  { suite: '测试用例管理', title: 'TC-TC-013 验证导入数据映射', priority: 'P2', status: 'UNTESTED', reqIndex: 14 },
  { suite: '测试用例管理', title: 'TC-TC-014 验证 Excel 用例导出', priority: 'P1', status: 'PASSED', reqIndex: 15 },

  // ========== 测试计划管理 ==========
  { suite: '测试计划管理', title: 'TC-TP-001 验证创建测试计划', priority: 'P0', status: 'PASSED', reqIndex: 1 },
  { suite: '测试计划管理', title: 'TC-TP-002 验证添加用例到计划', priority: 'P0', status: 'PASSED', reqIndex: 1 },
  { suite: '测试计划管理', title: 'TC-TP-003 验证计划复制功能', priority: 'P1', status: 'PASSED', reqIndex: 16 },
  { suite: '测试计划管理', title: 'TC-TP-004 验证复制后数据独立', priority: 'P2', status: 'UNTESTED', reqIndex: 16 },

  // ========== 测试执行 ==========
  { suite: '测试执行', title: 'TC-TE-001 验证执行用例标记结果', priority: 'P0', status: 'PASSED', reqIndex: 2 },
  { suite: '测试执行', title: 'TC-TE-002 验证执行状态变更', priority: 'P0', status: 'PASSED', reqIndex: 2 },
  { suite: '测试执行', title: 'TC-TE-003 验证执行备注填写', priority: 'P1', status: 'PASSED', reqIndex: 2 },
  { suite: '测试执行', title: 'TC-TE-004 验证执行用例操作', priority: 'P0', status: 'PASSED', reqIndex: 17 },
  { suite: '测试执行', title: 'TC-TE-005 验证证据附件上传', priority: 'P1', status: 'PASSED', reqIndex: 18 },
  { suite: '测试执行', title: 'TC-TE-006 验证附件预览下载', priority: 'P2', status: 'UNTESTED', reqIndex: 18 },

  // ========== 缺陷管理 ==========
  { suite: '缺陷管理', title: 'TC-DF-001 验证创建缺陷', priority: 'P0', status: 'PASSED', reqIndex: 3 },
  { suite: '缺陷管理', title: 'TC-DF-002 验证缺陷状态流转', priority: 'P0', status: 'PASSED', reqIndex: 3 },
  { suite: '缺陷管理', title: 'TC-DF-003 验证缺陷状态变更', priority: 'P0', status: 'PASSED', reqIndex: 19 },
  { suite: '缺陷管理', title: 'TC-DF-004 验证缺陷重新打开', priority: 'P1', status: 'PASSED', reqIndex: 19 },
  { suite: '缺陷管理', title: 'TC-DF-005 验证缺陷评论添加', priority: 'P1', status: 'PASSED', reqIndex: 20 },
  { suite: '缺陷管理', title: 'TC-DF-006 验证评论显示排序', priority: 'P2', status: 'PASSED', reqIndex: 20 },
  { suite: '缺陷管理', title: 'TC-DF-007 验证外部系统链接', priority: 'P2', status: 'UNTESTED', reqIndex: 21 },

  // ========== 统计分析 ==========
  { suite: '统计分析', title: 'TC-ST-001 验证执行状态统计', priority: 'P1', status: 'PASSED', reqIndex: 4 },
  { suite: '统计分析', title: 'TC-ST-002 验证进度报告展示', priority: 'P1', status: 'PASSED', reqIndex: 4 },
  { suite: '统计分析', title: 'TC-ST-003 验证统计数据准确性', priority: 'P0', status: 'PASSED', reqIndex: 22 },
  { suite: '统计分析', title: 'TC-ST-004 验证报告导出功能', priority: 'P2', status: 'UNTESTED', reqIndex: 23 },

  // ========== 需求管理 ==========
  { suite: '需求管理', title: 'TC-RQ-001 验证创建需求', priority: 'P0', status: 'PASSED', reqIndex: 7 },
  { suite: '需求管理', title: 'TC-RQ-002 验证需求验收标准', priority: 'P0', status: 'PASSED', reqIndex: 7 },
  { suite: '需求管理', title: 'TC-RQ-003 验证功能验收操作', priority: 'P1', status: 'PASSED', reqIndex: 8 },
  { suite: '需求管理', title: 'TC-RQ-004 验证验收通过流程', priority: 'P1', status: 'PASSED', reqIndex: 8 },
  { suite: '需求管理', title: 'TC-RQ-005 验证追溯视图展示', priority: 'P1', status: 'PASSED', reqIndex: 9 },
  { suite: '需求管理', title: 'TC-RQ-006 验证追溯链路完整', priority: 'P1', status: 'PASSED', reqIndex: 9 },
  { suite: '需求管理', title: 'TC-RQ-007 验证需求创建表单', priority: 'P0', status: 'PASSED', reqIndex: 26 },
  { suite: '需求管理', title: 'TC-RQ-008 验证需求状态流转', priority: 'P0', status: 'PASSED', reqIndex: 27 },
  { suite: '需求管理', title: 'TC-RQ-009 验证关联测试用例', priority: 'P0', status: 'PASSED', reqIndex: 28 },
  { suite: '需求管理', title: 'TC-RQ-010 验证功能验收界面', priority: 'P1', status: 'PASSED', reqIndex: 29 },
  { suite: '需求管理', title: 'TC-RQ-011 验证需求追溯视图', priority: 'P1', status: 'PASSED', reqIndex: 30 },
  { suite: '需求管理', title: 'TC-RQ-012 验证追溯矩阵导出', priority: 'P2', status: 'UNTESTED', reqIndex: 31 },

  // ========== 系统管理 ==========
  { suite: '系统管理', title: 'TC-SY-001 验证用户添加', priority: 'P1', status: 'PASSED', reqIndex: 24 },
  { suite: '系统管理', title: 'TC-SY-002 验证用户编辑', priority: 'P1', status: 'PASSED', reqIndex: 24 },
  { suite: '系统管理', title: 'TC-SY-003 验证用户删除', priority: 'P2', status: 'UNTESTED', reqIndex: 24 },
  { suite: '系统管理', title: 'TC-SY-004 验证主题切换', priority: 'P3', status: 'UNTESTED', reqIndex: 25 },
];

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const STATUSES = ['UNTESTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const REQUIREMENT_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];
const ACCEPTANCE_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'];

// PRD_v2 中的 NexusQA 产品需求（US-001 到 US-010）
const NEXUSQA_REQUIREMENTS = [
  {
    title: 'US-001 快速创建测试用例',
    description: `## 背景
测试工程师需要编写大量测试用例，传统方式耗时且重复劳动多。

## 功能说明
借助 AI 快速生成测试步骤，减少用例编写时间，让测试工程师专注于测试设计本身。

## 主流程
1. 进入项目用例列表页
2. 点击"新建用例"按钮
3. 填写用例标题和描述
4. 点击"AI 生成步骤"按钮
5. 检查并调整生成的步骤
6. 设置优先级、标签等属性
7. 点击"保存"按钮`,
    userStories: [
      { role: '测试工程师', goal: '借助 AI 快速生成测试步骤', benefit: '减少用例编写时间，专注于测试设计本身' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 用户有用例创建权限\n- 已存在至少一个项目',
    businessRules: [],
    designReferences: [
      { type: 'link', url: '/prd/us-001-wireframe', title: '用例创建表单线框图' },
    ],
    targetVersion: 'v1.0.0',
    estimatedEffort: '5d',
    tags: ['用例管理', 'AI生成', 'P0', '核心功能'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '用例创建表单包含必填字段：标题；选填字段：描述、前置条件、步骤、优先级、标签', status: 'PASSED' },
      { description: 'AI 生成按钮点击后，10 秒内返回结果或超时提示', status: 'PASSED' },
      { description: 'AI 生成的步骤格式为 { action: string, expected: string }', status: 'PASSED' },
      { description: '生成的步骤数量在 3-8 个之间', status: 'PENDING' },
      { description: '用户可以编辑、删除、调整 AI 生成的步骤顺序', status: 'PASSED' },
      { description: '保存成功后，页面跳转到用例列表，新用例显示在列表顶部', status: 'PASSED' },
      { description: '保存失败时，显示具体错误信息，表单数据不丢失', status: 'PENDING' },
    ]
  },
  {
    title: 'US-002 组织回归测试',
    description: `## 背景
每次迭代发版前需要进行回归测试，手动重新组织测试计划效率低。

## 功能说明
快速复制上一轮的测试计划，组织新一轮回归测试，而不需要重新添加所有用例。

## 主流程
1. 进入项目测试计划列表页
2. 找到要复制的计划，点击"复制"按钮
3. 确认复制操作
4. 系统创建新计划，名称添加"(Copy)"后缀
5. 复制所有关联用例，生成快照
6. 所有用例状态重置为 UNTESTED
7. 根据需要调整计划名称和用例`,
    userStories: [
      { role: '测试负责人', goal: '快速复制上一轮的测试计划', benefit: '组织新一轮回归测试，而不需要重新添加所有用例' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有测试计划管理权限\n- 已存在至少一个包含用例的测试计划',
    businessRules: [
      { code: 'BR-001', description: '快照保存用例在复制时刻的完整信息，后续对原用例的修改不影响快照' },
      { code: 'BR-002', description: '复制计划不复制执行历史，仅复制用例本身' },
      { code: 'BR-003', description: '复制计划的创建者为当前操作用户' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['测试计划', '回归测试', 'P0', '核心功能'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '复制后的计划名称 = 原名称 + " (Copy)"', status: 'PASSED' },
      { description: '复制后的计划包含原计划所有用例', status: 'PASSED' },
      { description: '每个用例生成独立快照（JSON 格式），快照内容包含用例当前状态', status: 'PASSED' },
      { description: '所有用例执行状态重置为 UNTESTED', status: 'PASSED' },
      { description: '复制操作在 5 秒内完成（100 个用例以内）', status: 'PENDING' },
      { description: '复制失败时显示具体错误信息，不产生脏数据', status: 'PENDING' },
      { description: '复制后的计划与原计划相互独立，修改互不影响', status: 'PASSED' },
    ]
  },
  {
    title: 'US-003 执行测试并记录结果',
    description: `## 背景
测试工程师按计划执行测试时，需要记录执行结果，失败时关联或创建缺陷。

## 功能说明
按计划执行测试并快速记录结果，当测试失败时能够直接创建缺陷，保持测试数据的完整性。

## 主流程
1. 进入测试计划执行页面
2. 点击一个待执行的用例
3. 按步骤执行测试
4. 点击"通过"/"失败"/"阻塞"按钮
5. 若选择"失败"，弹出缺陷创建/关联面板
6. 填写缺陷信息或选择已有缺陷
7. 执行面板关闭，列表更新状态`,
    userStories: [
      { role: '测试工程师', goal: '按计划执行测试并快速记录结果', benefit: '当测试失败时能够直接创建缺陷，保持测试数据的完整性' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 用户有测试执行权限\n- 测试计划中包含待执行的用例',
    businessRules: [
      { code: 'BR-003', description: '【红线规则】执行失败（FAILED）必须关联缺陷，否则无法提交' },
      { code: 'BR-004', description: '同一用例在同一计划中可多次执行，保留所有执行历史' },
      { code: 'BR-005', description: '计划进度 = 已执行用例数 / 总用例数' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '5d',
    tags: ['测试执行', '缺陷管理', 'P0', '核心功能'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '执行状态可选值：PASSED、FAILED、BLOCKED、SKIPPED', status: 'PASSED' },
      { description: '选择 FAILED 时，必须关联或创建缺陷才能提交', status: 'PENDING' },
      { description: '执行记录包含：执行者、执行时间、执行状态、备注、关联缺陷', status: 'PASSED' },
      { description: '执行结果实时更新到计划进度统计', status: 'PASSED' },
      { description: '支持添加执行备注（可选）', status: 'PASSED' },
      { description: '执行历史按时间倒序排列，可查看任意历史记录', status: 'PENDING' },
    ]
  },
  {
    title: 'US-004 追踪缺陷处理进度',
    description: `## 背景
测试工程师提交缺陷后，需要追踪处理进度，并与开发人员沟通。

## 功能说明
追踪提交的缺陷的处理进度，并能与开发人员在缺陷下进行讨论，及时跟进问题解决。

## 缺陷状态流转
OPEN → IN_PROGRESS → RESOLVED → CLOSED
（可从任意状态重新打开回到 OPEN）

## 主流程
1. 进入缺陷列表页
2. 点击某个缺陷
3. 查看缺陷状态和处理进度
4. 在讨论区添加评论
5. 点击"发送"，评论保存并通知相关人员`,
    userStories: [
      { role: '测试工程师', goal: '追踪我提交的缺陷的处理进度', benefit: '能与开发人员在缺陷下进行讨论，及时跟进问题解决' },
      { role: '开发工程师', goal: '查看缺陷详情和复现步骤', benefit: '快速定位和修复问题' },
    ],
    targetUsers: ['TESTER', 'DEVELOPER'],
    preconditions: '- 用户已登录系统\n- 存在已创建的缺陷',
    businessRules: [],
    designReferences: [
      { type: 'link', url: '/prd/defect-state-flow', title: '缺陷状态流转图' },
    ],
    targetVersion: 'v1.0.0',
    estimatedEffort: '4d',
    tags: ['缺陷管理', 'P0', '核心功能'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '缺陷状态可选值：OPEN、IN_PROGRESS、RESOLVED、CLOSED', status: 'PASSED' },
      { description: '状态变更时自动记录变更历史（谁、什么时候、从什么状态变更为什么状态）', status: 'PENDING' },
      { description: '讨论评论支持 @提及 用户', status: 'PENDING' },
      { description: '新评论发布后，被 @提及 的用户收到通知（V1.1）', status: 'PENDING' },
      { description: '支持按状态、严重级、分配者筛选缺陷', status: 'PASSED' },
      { description: '支持按创建时间、更新时间、严重级排序', status: 'PASSED' },
    ]
  },
  {
    title: 'US-005 查看测试进度报告',
    description: `## 背景
测试负责人需要向团队和管理层汇报测试质量状态。

## 功能说明
查看测试计划的执行进度和缺陷分布情况，向团队和管理层汇报质量状态。

## 主流程
1. 进入项目统计分析页
2. 查看测试执行统计（Pass/Fail/Blocked/Untested 比例图）
3. 查看缺陷分布统计（按状态、严重级分类）
4. 选择特定测试计划查看详细统计
5.（可选）导出报告`,
    userStories: [
      { role: '测试负责人', goal: '查看测试计划的执行进度和缺陷分布情况', benefit: '向团队和管理层汇报质量状态' },
      { role: '产品经理', goal: '了解测试覆盖和通过情况', benefit: '评估发布风险' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在已执行的测试计划',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '4d',
    tags: ['统计分析', '报告', 'P1'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '显示测试执行状态分布饼图（Pass/Fail/Blocked/Untested）', status: 'PASSED' },
      { description: '显示测试通过率 = PASSED / (PASSED + FAILED + BLOCKED)', status: 'PASSED' },
      { description: '显示缺陷严重级分布柱状图', status: 'PENDING' },
      { description: '显示缺陷状态分布（Open/In Progress/Resolved/Closed）', status: 'PENDING' },
      { description: '数据实时更新（页面刷新后获取最新数据）', status: 'PASSED' },
    ]
  },
  {
    title: 'US-006 评审测试用例',
    description: `## 背景
为保证用例质量，需要对团队成员编写的测试用例进行评审。

## 功能说明
评审团队成员编写的测试用例，并给出审批意见或修改建议，保证用例质量。

## 评审状态流转
PENDING → APPROVED
PENDING → CHANGES_REQUESTED → PENDING（重新提交后）

## 主流程
1. 进入用例列表，筛选"待评审"状态
2. 点击某个用例
3. 查看用例内容、步骤
4. 点击"通过评审"或"需要修改"
5.（需修改时）填写修改建议
6. 状态更新`,
    userStories: [
      { role: '测试负责人', goal: '评审团队成员编写的测试用例', benefit: '并给出审批意见或修改建议，保证用例质量' },
      { role: '产品经理', goal: '参与关键用例评审', benefit: '确保用例覆盖所有需求场景' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 用户有用例评审权限\n- 存在待评审的用例',
    businessRules: [
      { code: 'BR-006', description: '建议：未通过评审（非 APPROVED）的用例不应进入正式执行' },
      { code: 'BR-007', description: '用例修改后，评审状态自动重置为 PENDING' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['用例评审', 'P1'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '评审状态可选值：PENDING、APPROVED、CHANGES_REQUESTED', status: 'PASSED' },
      { description: '只有 PENDING 状态的用例可以被评审', status: 'PASSED' },
      { description: '评审意见保存在用例历史中，可追溯', status: 'PENDING' },
      { description: '用例作者收到评审结果通知（V1.1）', status: 'PENDING' },
      { description: '支持批量评审操作', status: 'PENDING' },
    ]
  },
  {
    title: 'US-007 从 Excel 导入用例',
    description: `## 背景
团队可能已有 Excel 格式的用例数据，需要批量导入到系统中。

## 功能说明
从 Excel 文件批量导入测试用例，快速迁移已有用例数据。

## 主流程
1. 点击"导入用例"按钮
2. 下载模板文件（可选）
3. 上传 Excel 文件
4. 检查数据映射
5. 确认导入
6. 导入完成，显示结果（成功/失败数量）`,
    userStories: [
      { role: '测试工程师', goal: '从 Excel 文件批量导入测试用例', benefit: '快速迁移已有用例数据' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 用户有用例创建权限\n- 已准备符合模板格式的 Excel 文件',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '5d',
    tags: ['数据导入', 'Excel', 'P2'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持 .xlsx、.xls 格式文件', status: 'PENDING' },
      { description: '单次导入上限 500 条用例', status: 'PENDING' },
      { description: '导入前显示数据预览，用户确认后执行', status: 'PENDING' },
      { description: '导入失败的行标记原因，支持下载错误报告', status: 'PENDING' },
      { description: '导入支持增量模式（仅新增）和覆盖模式（更新已有）', status: 'PENDING' },
    ]
  },
  {
    title: 'US-008 定义需求和验收标准',
    description: `## 背景
产品经理需要在系统中管理需求，定义清晰的验收标准供测试团队使用。

## 功能说明
在系统中创建需求并定义清晰的验收标准，测试团队能够据此设计测试用例，确保功能实现符合预期。

## 需求状态流转
DRAFT → PENDING_REVIEW → APPROVED → IN_PROGRESS → COMPLETED

## 主流程
1. 进入项目需求管理页面
2. 点击"新建需求"按钮
3. 填写需求标题和描述
4. 编写验收标准（AC）
5. 设置优先级和标签
6. 点击"保存"按钮`,
    userStories: [
      { role: '产品经理', goal: '在系统中创建需求并定义清晰的验收标准', benefit: '测试团队能够据此设计测试用例，确保功能实现符合预期' },
    ],
    targetUsers: ['PM'],
    preconditions: '- 用户已登录系统\n- 用户角色为 PM 或 Admin\n- 已存在至少一个项目',
    businessRules: [
      { code: 'BR-008', description: '验收标准必须具体可测，禁止使用模糊描述（如"体验良好"、"性能优秀"）' },
      { code: 'BR-009', description: '需求状态流转：DRAFT → PENDING_REVIEW → APPROVED → IN_PROGRESS → COMPLETED' },
    ],
    designReferences: [
      { type: 'link', url: '/prd/requirement-form', title: '需求创建表单原型' },
    ],
    targetVersion: 'v1.0.0',
    estimatedEffort: '5d',
    tags: ['需求管理', 'P1'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '需求包含必填字段：标题；选填字段：描述、验收标准、优先级、标签', status: 'PASSED' },
      { description: '验收标准支持多条录入，每条 AC 独立编辑', status: 'PASSED' },
      { description: '需求创建后状态为"草稿"', status: 'PASSED' },
      { description: '需求可关联到测试用例（多对多关系）', status: 'PASSED' },
      { description: '需求详情页显示关联的测试用例列表', status: 'PASSED' },
    ]
  },
  {
    title: 'US-009 功能验收',
    description: `## 背景
产品经理需要对需求关联的功能进行验收确认，把控产品质量和发布节奏。

## 功能说明
查看与需求相关的测试执行结果，并对功能进行验收确认。

## 验收状态
- PENDING：待验收
- ACCEPTED：验收通过
- REJECTED：验收不通过（需填写原因）

## 主流程
1. 进入需求详情页
2. 查看测试执行情况
3. 查看验收标准达成情况
4. 点击"验收通过"或"验收不通过"
5.（不通过时）填写验收意见
6. 确认提交`,
    userStories: [
      { role: '产品经理', goal: '查看与我负责的需求相关的测试执行结果，并对功能进行验收确认', benefit: '把控产品质量和发布节奏' },
    ],
    targetUsers: ['PM'],
    preconditions: '- 用户已登录系统\n- 用户角色为 PM 或 Admin\n- 存在已执行的测试计划\n- 存在与需求关联的测试用例',
    businessRules: [
      { code: 'BR-010', description: '产品经理有权在任意时刻进行验收，但系统会提示测试完成度' },
      { code: 'BR-011', description: '验收不通过的需求，关联的缺陷应重新打开或创建新缺陷' },
    ],
    designReferences: [
      { type: 'link', url: '/prd/acceptance-modal', title: '验收确认弹窗原型' },
    ],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['需求管理', '验收', 'P2'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '需求详情页显示测试执行进度：已执行/总数', status: 'PASSED' },
      { description: '显示测试通过率：通过数/（通过+失败）', status: 'PASSED' },
      { description: '验收状态可选值：PENDING、ACCEPTED、REJECTED', status: 'PASSED' },
      { description: '验收操作记录：验收人、验收时间、验收意见', status: 'PASSED' },
      { description: '验收不通过时，验收意见为必填项', status: 'PENDING' },
      { description: '验收历史可追溯查看', status: 'PENDING' },
    ]
  },
  {
    title: 'US-010 需求到测试追溯',
    description: `## 背景
产品经理和测试负责人需要了解需求的测试覆盖情况，确保没有遗漏。

## 功能说明
查看从需求到测试用例的完整追溯链，了解需求的测试覆盖情况。

## 追溯矩阵示例
- REQ-001: 用户登录功能 → 覆盖率 100%
  - AC1: 正确密码可登录 → TC-001 PASSED
  - AC2: 错误密码被拒绝 → TC-002 PASSED
  - AC3: 连续错误锁定账户 → TC-003 FAILED (关联 BUG-042)

## 主流程
1. 进入需求追溯视图
2. 选择某个需求
3. 查看覆盖情况
4.（可选）导出追溯报告`,
    userStories: [
      { role: '产品经理', goal: '查看从需求到测试用例的完整追溯链', benefit: '了解需求的测试覆盖情况，确保没有遗漏' },
      { role: '测试负责人', goal: '查看追溯矩阵', benefit: '发现未覆盖的需求和 AC，指导用例补充' },
    ],
    targetUsers: ['PM', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在已创建的需求和测试用例\n- 存在需求与用例的关联关系',
    businessRules: [],
    designReferences: [
      { type: 'link', url: '/prd/traceability-matrix', title: '追溯矩阵视图原型' },
    ],
    targetVersion: 'v1.1.0',
    estimatedEffort: '5d',
    tags: ['需求管理', '追溯', 'P2'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '追溯视图显示每个需求的测试覆盖率', status: 'PENDING' },
      { description: '未覆盖的需求/AC 高亮显示', status: 'PENDING' },
      { description: '点击用例可跳转到用例详情页', status: 'PENDING' },
      { description: '支持按覆盖状态筛选（全覆盖/部分覆盖/未覆盖）', status: 'PENDING' },
      { description: '支持导出追溯矩阵（Excel 格式）', status: 'PENDING' },
    ]
  },

  // ========== 模块一：项目管理 ==========
  {
    title: 'F-PM-001 创建项目',
    description: `## 功能说明
系统管理员可以创建新项目，项目是测试管理的基础容器。

## 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 项目名称，1-100 字符 |
| description | string | 否 | 项目描述，最长 500 字符 |
| coverImage | string | 否 | 封面图 URL |`,
    userStories: [
      { role: '系统管理员', goal: '创建新的测试项目', benefit: '为团队提供测试管理的工作空间' },
    ],
    targetUsers: ['ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 Admin',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['项目管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '项目名称必填，1-100 字符', status: 'PASSED' },
      { description: '名称不允许重复（同一用户下）', status: 'PASSED' },
      { description: '创建成功后跳转到项目详情页', status: 'PASSED' },
    ]
  },
  {
    title: 'F-PM-002 项目列表',
    description: `## 功能说明
展示用户可访问的所有项目，支持搜索和筛选。`,
    userStories: [
      { role: '用户', goal: '查看所有可访问的项目', benefit: '快速找到需要的项目' },
    ],
    targetUsers: ['ADMIN', 'QA_LEAD', 'TESTER'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['项目管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示项目卡片列表，包含名称、描述、创建时间', status: 'PASSED' },
      { description: '支持按项目名称搜索', status: 'PASSED' },
      { description: '点击项目卡片进入项目详情', status: 'PASSED' },
    ]
  },
  {
    title: 'F-PM-003 项目详情',
    description: `## 功能说明
展示项目的详细信息，包括测试用例、测试计划、缺陷等模块入口。`,
    userStories: [
      { role: '用户', goal: '查看项目详情和各模块入口', benefit: '了解项目整体情况' },
    ],
    targetUsers: ['ADMIN', 'QA_LEAD', 'TESTER'],
    preconditions: '- 用户已登录系统\n- 用户有项目访问权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['项目管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示项目基本信息（名称、描述、创建时间）', status: 'PASSED' },
      { description: '提供测试用例、测试计划、缺陷等模块的导航入口', status: 'PASSED' },
      { description: '显示项目统计概览', status: 'PASSED' },
    ]
  },
  {
    title: 'F-PM-004 编辑项目',
    description: `## 功能说明
编辑项目的基本信息，如名称、描述等。`,
    userStories: [
      { role: '项目管理员', goal: '更新项目信息', benefit: '保持项目信息准确' },
    ],
    targetUsers: ['ADMIN', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有项目管理权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['项目管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '可以修改项目名称和描述', status: 'PASSED' },
      { description: '名称修改后不允许与其他项目重复', status: 'PASSED' },
      { description: '保存成功后显示更新后的信息', status: 'PASSED' },
    ]
  },
  {
    title: 'F-PM-005 删除项目',
    description: `## 功能说明
删除项目及其所有关联数据（用例、计划、缺陷等）。`,
    userStories: [
      { role: '系统管理员', goal: '删除不再需要的项目', benefit: '清理系统资源' },
    ],
    targetUsers: ['ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 Admin',
    businessRules: [
      { code: 'BR-DEL-001', description: '删除项目会级联删除所有关联数据' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['项目管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '删除前显示确认对话框', status: 'PASSED' },
      { description: '删除后级联清理所有关联数据', status: 'PASSED' },
      { description: '删除成功后跳转到项目列表', status: 'PASSED' },
    ]
  },
  {
    title: 'F-PM-006 项目成员管理',
    description: `## 功能说明
管理项目的成员权限，支持添加、移除项目成员，设置成员角色。

## 主流程
1. 进入项目设置页
2. 选择"成员管理"标签
3. 点击"添加成员"
4. 选择用户和角色
5. 保存`,
    userStories: [
      { role: '项目管理员', goal: '管理项目成员和权限', benefit: '控制团队成员的访问权限' },
    ],
    targetUsers: ['ADMIN', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有项目管理权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['项目管理', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '可以添加用户到项目', status: 'PENDING' },
      { description: '可以为成员分配角色', status: 'PENDING' },
      { description: '可以移除项目成员', status: 'PENDING' },
      { description: '成员变更后权限立即生效', status: 'PENDING' },
    ]
  },

  // ========== 模块二：测试用例管理 ==========
  {
    title: 'F-TC-001 创建用例',
    description: `## 功能说明
创建新的测试用例，包含标题、描述、步骤等信息。

## 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 用例标题，1-200 字符 |
| description | string | 否 | 用例描述 |
| preconditions | string | 否 | 前置条件 |
| steps | TestStep[] | 否 | 测试步骤 |
| priority | enum | 否 | 优先级，默认 P2 |`,
    userStories: [
      { role: '测试工程师', goal: '创建测试用例', benefit: '记录测试场景和步骤' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有用例创建权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '标题为必填项，1-200 字符', status: 'PASSED' },
      { description: '支持添加多个测试步骤', status: 'PASSED' },
      { description: '创建成功后显示在用例列表', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-002 编辑用例',
    description: `## 功能说明
编辑已有的测试用例信息。`,
    userStories: [
      { role: '测试工程师', goal: '修改测试用例', benefit: '完善用例内容' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用例存在',
    businessRules: [
      { code: 'BR-007', description: '用例修改后，评审状态自动重置为 PENDING' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '可以修改用例所有字段', status: 'PASSED' },
      { description: '修改后评审状态重置为 PENDING', status: 'PASSED' },
      { description: '保存成功后显示更新时间', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-003 删除用例',
    description: `## 功能说明
删除测试用例。`,
    userStories: [
      { role: '测试工程师', goal: '删除不需要的用例', benefit: '保持用例库整洁' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用例存在',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '删除前显示确认对话框', status: 'PASSED' },
      { description: '删除后从列表移除', status: 'PASSED' },
      { description: '关联的计划用例同步移除', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-004 用例列表',
    description: `## 功能说明
展示项目下所有测试用例，支持分页和排序。`,
    userStories: [
      { role: '测试工程师', goal: '查看用例列表', benefit: '浏览和管理测试用例' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有项目访问权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '以表格形式显示用例列表', status: 'PASSED' },
      { description: '显示用例关键信息（标题、优先级、状态等）', status: 'PASSED' },
      { description: '支持点击行查看详情', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-005 用例搜索',
    description: `## 功能说明
按关键词搜索测试用例。`,
    userStories: [
      { role: '测试工程师', goal: '搜索特定用例', benefit: '快速找到目标用例' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '支持按标题关键词搜索', status: 'PASSED' },
      { description: '搜索结果实时更新', status: 'PASSED' },
      { description: '无匹配结果时显示空状态', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-006 套件管理（树形）',
    description: `## 功能说明
以树形结构管理测试套件，支持创建、重命名、删除套件。`,
    userStories: [
      { role: '测试工程师', goal: '组织测试用例', benefit: '分类管理大量用例' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['用例管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '支持创建多级套件', status: 'PASSED' },
      { description: '支持重命名套件', status: 'PASSED' },
      { description: '删除套件时可选择是否删除子用例', status: 'PASSED' },
      { description: '支持拖拽用例到不同套件', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-007 AI 生成测试步骤',
    description: `## 功能说明
基于用例标题和描述，使用 AI 自动生成测试步骤，减少手动编写工作量。

## 输入
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 用例标题 |
| description | string | 否 | 用例描述 |

## 输出
\`\`\`json
[
  { "action": "操作描述", "expected": "预期结果" },
  { "action": "操作描述", "expected": "预期结果" }
]
\`\`\``,
    userStories: [
      { role: '测试工程师', goal: '使用 AI 生成测试步骤', benefit: '提高用例编写效率' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 网络连接可用\n- AI 服务可用',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '5d',
    tags: ['用例管理', 'AI', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '生成 3-8 个测试步骤', status: 'PASSED' },
      { description: '响应时间 < 10 秒', status: 'PASSED' },
      { description: '超时返回友好提示，允许重试', status: 'PASSED' },
      { description: '生成失败不影响其他表单操作', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-008 用例筛选',
    description: `## 功能说明
按优先级、状态、标签等条件筛选测试用例。`,
    userStories: [
      { role: '测试工程师', goal: '按条件筛选用例', benefit: '快速定位目标用例' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['用例管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持按优先级筛选', status: 'PASSED' },
      { description: '支持按执行状态筛选', status: 'PASSED' },
      { description: '支持多条件组合筛选', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-009 批量删除',
    description: `## 功能说明
批量删除选中的测试用例。`,
    userStories: [
      { role: '测试工程师', goal: '批量删除用例', benefit: '提高操作效率' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 选中多个用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['用例管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持多选用例', status: 'PASSED' },
      { description: '删除前显示确认对话框，显示将删除的数量', status: 'PASSED' },
      { description: '删除成功后刷新列表', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-010 批量移动',
    description: `## 功能说明
批量移动选中的测试用例到指定套件。`,
    userStories: [
      { role: '测试工程师', goal: '批量移动用例', benefit: '重新组织用例结构' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 选中多个用例\n- 存在目标套件',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['用例管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持多选用例', status: 'PASSED' },
      { description: '显示套件选择下拉', status: 'PASSED' },
      { description: '移动成功后刷新列表', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TC-011 用例评审',
    description: `## 功能说明
对测试用例进行质量评审，确保用例质量符合标准。

## 评审状态流转
PENDING → APPROVED
PENDING → CHANGES_REQUESTED → PENDING（重新提交后）`,
    userStories: [
      { role: '测试负责人', goal: '评审团队的测试用例', benefit: '确保用例质量' },
      { role: '产品经理', goal: '参与关键用例评审', benefit: '确保用例覆盖需求' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 用户有评审权限\n- 存在待评审用例',
    businessRules: [
      { code: 'BR-006', description: '未通过评审的用例不应进入正式执行' },
      { code: 'BR-007', description: '用例修改后，评审状态自动重置为 PENDING' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['用例管理', '评审', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '评审状态可选值：PENDING、APPROVED、CHANGES_REQUESTED', status: 'PASSED' },
      { description: '只有 PENDING 状态的用例可以被评审', status: 'PASSED' },
      { description: '评审意见保存在用例历史中', status: 'PASSED' },
      { description: '支持批量评审操作', status: 'PENDING' },
    ]
  },
  {
    title: 'F-TC-012 用例复制',
    description: `## 功能说明
复制现有测试用例，快速创建相似用例。`,
    userStories: [
      { role: '测试工程师', goal: '复制用例', benefit: '快速创建相似测试场景' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在可复制的用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '1d',
    tags: ['用例管理', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '复制后的用例标题添加 "(Copy)" 后缀', status: 'PENDING' },
      { description: '复制所有字段内容', status: 'PENDING' },
      { description: '复制后的用例状态重置为 PENDING', status: 'PENDING' },
    ]
  },
  {
    title: 'F-TC-013 用例导入（Excel）',
    description: `## 功能说明
从 Excel 文件批量导入测试用例，支持数据迁移场景。

## 主流程
1. 点击"导入用例"按钮
2. 下载模板文件（可选）
3. 上传 Excel 文件
4. 检查数据映射
5. 确认导入
6. 显示导入结果`,
    userStories: [
      { role: '测试工程师', goal: '从 Excel 批量导入用例', benefit: '快速迁移已有用例数据' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有用例创建权限\n- 已准备符合模板的 Excel 文件',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '5d',
    tags: ['用例管理', '导入导出', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持 .xlsx、.xls 格式文件', status: 'PENDING' },
      { description: '单次导入上限 500 条用例', status: 'PENDING' },
      { description: '导入前显示数据预览', status: 'PENDING' },
      { description: '导入失败的行标记原因', status: 'PENDING' },
    ]
  },
  {
    title: 'F-TC-014 用例导出（Excel）',
    description: `## 功能说明
将测试用例导出为 Excel 格式，支持离线查看和分享。`,
    userStories: [
      { role: '测试工程师', goal: '导出用例到 Excel', benefit: '离线查看和分享用例' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在可导出的用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['用例管理', '导入导出', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持导出为 .xlsx 格式', status: 'PENDING' },
      { description: '支持选择导出范围（全部/筛选/选中）', status: 'PENDING' },
      { description: '导出内容包含完整用例信息', status: 'PENDING' },
    ]
  },

  // ========== 模块三：测试计划管理 ==========
  {
    title: 'F-TP-001 创建计划',
    description: `## 功能说明
创建新的测试计划，用于组织和执行测试用例。`,
    userStories: [
      { role: '测试负责人', goal: '创建测试计划', benefit: '组织测试执行工作' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有计划管理权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '计划名称为必填项', status: 'PASSED' },
      { description: '创建成功后显示在计划列表', status: 'PASSED' },
      { description: '支持设置计划描述和时间范围', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-002 计划列表',
    description: `## 功能说明
展示项目下所有测试计划。`,
    userStories: [
      { role: '测试负责人', goal: '查看计划列表', benefit: '了解测试计划概况' },
    ],
    targetUsers: ['QA_LEAD', 'TESTER'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '以卡片/列表形式显示计划', status: 'PASSED' },
      { description: '显示计划进度统计', status: 'PASSED' },
      { description: '点击计划进入执行页面', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-003 添加用例到计划',
    description: `## 功能说明
将测试用例添加到测试计划中。`,
    userStories: [
      { role: '测试负责人', goal: '添加用例到计划', benefit: '组织测试范围' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在测试计划和用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '支持批量添加用例', status: 'PASSED' },
      { description: '添加时生成用例快照', status: 'PASSED' },
      { description: '显示已添加的用例数量', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-004 从计划移除用例',
    description: `## 功能说明
从测试计划中移除用例。`,
    userStories: [
      { role: '测试负责人', goal: '移除计划中的用例', benefit: '调整测试范围' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 计划中存在用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '移除前显示确认提示', status: 'PASSED' },
      { description: '移除后更新计划进度', status: 'PASSED' },
      { description: '移除的用例执行记录保留', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-005 计划执行页面',
    description: `## 功能说明
展示计划中所有用例的执行状态，支持执行操作。`,
    userStories: [
      { role: '测试工程师', goal: '在计划页面执行用例', benefit: '高效完成测试任务' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 计划中存在用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示用例列表及执行状态', status: 'PASSED' },
      { description: '支持按状态筛选用例', status: 'PASSED' },
      { description: '点击用例打开执行面板', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-006 计划进度统计',
    description: `## 功能说明
展示测试计划的执行进度统计。`,
    userStories: [
      { role: '测试负责人', goal: '查看计划进度', benefit: '了解测试完成情况' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 计划中存在用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试计划', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示执行状态分布（Pass/Fail/Blocked/Untested）', status: 'PASSED' },
      { description: '显示整体进度百分比', status: 'PASSED' },
      { description: '数据实时更新', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-007 计划复制',
    description: `## 功能说明
复制现有测试计划，快速创建回归测试计划。

## 复制规则
- 复制后的计划名称 = 原名称 + " (Copy)"
- 复制所有关联用例，每个生成独立快照
- 所有用例状态重置为 UNTESTED`,
    userStories: [
      { role: '测试负责人', goal: '复制测试计划', benefit: '快速组织回归测试' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有计划管理权限\n- 存在可复制的计划',
    businessRules: [
      { code: 'BR-001', description: '快照保存用例在复制时刻的完整信息' },
      { code: 'BR-002', description: '复制计划不复制执行历史' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试计划', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '复制后的计划名称 = 原名称 + " (Copy)"', status: 'PASSED' },
      { description: '复制所有关联用例，每个生成独立快照', status: 'PASSED' },
      { description: '所有用例状态重置为 UNTESTED', status: 'PASSED' },
      { description: '100 个用例以内，5 秒内完成', status: 'PENDING' },
      { description: '复制失败回滚，不产生脏数据', status: 'PENDING' },
    ]
  },
  {
    title: 'F-TP-008 编辑计划',
    description: `## 功能说明
编辑测试计划的基本信息。`,
    userStories: [
      { role: '测试负责人', goal: '更新计划信息', benefit: '调整计划细节' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有计划管理权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['测试计划', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '可以修改计划名称和描述', status: 'PASSED' },
      { description: '可以修改计划时间范围', status: 'PASSED' },
      { description: '保存成功后显示更新时间', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TP-009 删除计划',
    description: `## 功能说明
删除测试计划及其执行记录。`,
    userStories: [
      { role: '测试负责人', goal: '删除不需要的计划', benefit: '清理历史数据' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有计划管理权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['测试计划', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '删除前显示确认对话框', status: 'PASSED' },
      { description: '删除后清理所有执行记录', status: 'PASSED' },
      { description: '删除成功后跳转到计划列表', status: 'PASSED' },
    ]
  },

  // ========== 模块四：测试执行 ==========
  {
    title: 'F-TE-001 执行用例（标记结果）',
    description: `## 功能说明
在测试计划中执行用例，标记执行结果。

## 状态可选值
| 状态 | 说明 | 是否需要关联缺陷 |
|------|------|-----------------|
| PASSED | 执行通过 | 否 |
| FAILED | 执行失败 | **是（必须）** |
| BLOCKED | 被阻塞 | 否（建议填写原因） |
| SKIPPED | 跳过执行 | 否 |`,
    userStories: [
      { role: '测试工程师', goal: '执行测试用例并记录结果', benefit: '跟踪测试进度' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 用户有执行权限\n- 测试计划中有待执行用例',
    businessRules: [
      { code: 'BR-003', description: '【红线规则】执行失败必须关联缺陷' },
      { code: 'BR-004', description: '同一用例可多次执行，保留所有历史' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['测试执行', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '状态为 FAILED 时，必须关联缺陷才能提交', status: 'PASSED' },
      { description: '每次执行自动记录执行者和时间', status: 'PASSED' },
      { description: '执行历史按时间倒序排列', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TE-002 执行备注',
    description: `## 功能说明
执行测试用例时添加备注信息。`,
    userStories: [
      { role: '测试工程师', goal: '添加执行备注', benefit: '记录执行过程中的关键信息' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 正在执行测试用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['测试执行', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '执行时可以填写备注（可选）', status: 'PASSED' },
      { description: '备注保存在执行记录中', status: 'PASSED' },
      { description: '历史记录中可以查看备注', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TE-003 关联缺陷',
    description: `## 功能说明
执行失败时关联或创建缺陷。`,
    userStories: [
      { role: '测试工程师', goal: '关联缺陷到执行', benefit: '建立执行与缺陷的追溯关系' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 执行结果为 FAILED',
    businessRules: [
      { code: 'BR-003', description: '执行失败必须关联缺陷' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试执行', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '支持选择已有缺陷关联', status: 'PASSED' },
      { description: '支持直接创建新缺陷', status: 'PASSED' },
      { description: '关联信息保存在执行记录中', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TE-004 执行历史',
    description: `## 功能说明
查看用例的执行历史记录。`,
    userStories: [
      { role: '测试工程师', goal: '查看执行历史', benefit: '了解用例的执行轨迹' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在执行记录',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['测试执行', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示所有执行记录列表', status: 'PASSED' },
      { description: '记录按时间倒序排列', status: 'PASSED' },
      { description: '每条记录显示执行者、时间、状态、备注', status: 'PASSED' },
    ]
  },
  {
    title: 'F-TE-005 证据附件上传',
    description: `## 功能说明
执行测试时上传截图、日志等证据附件，支持问题追溯。`,
    userStories: [
      { role: '测试工程师', goal: '上传测试证据', benefit: '便于问题复现和追溯' },
    ],
    targetUsers: ['TESTER'],
    preconditions: '- 用户已登录系统\n- 正在执行测试用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['测试执行', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持上传图片（PNG/JPG）', status: 'PENDING' },
      { description: '支持上传日志文件', status: 'PENDING' },
      { description: '附件与执行记录关联', status: 'PENDING' },
      { description: '附件可以预览和下载', status: 'PENDING' },
    ]
  },

  // ========== 模块五：缺陷管理 ==========
  {
    title: 'F-DF-001 创建缺陷',
    description: `## 功能说明
创建新的缺陷记录，记录问题信息。

## 字段说明
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 缺陷标题，1-200 字符 |
| description | string | 否 | 缺陷描述，支持 Markdown |
| severity | enum | 是 | 严重级：CRITICAL/HIGH/MEDIUM/LOW |
| assigneeId | string | 否 | 分配给谁 |`,
    userStories: [
      { role: '测试工程师', goal: '创建缺陷记录', benefit: '记录发现的问题' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 用户有缺陷创建权限',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '标题为必填项，1-200 字符', status: 'PASSED' },
      { description: '严重级为必填项', status: 'PASSED' },
      { description: '创建成功后状态为 OPEN', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-002 缺陷列表',
    description: `## 功能说明
展示项目下所有缺陷，支持筛选和排序。`,
    userStories: [
      { role: '测试工程师', goal: '查看缺陷列表', benefit: '了解项目缺陷情况' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD', 'DEVELOPER'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '以表格形式显示缺陷列表', status: 'PASSED' },
      { description: '显示缺陷关键信息（标题、状态、严重级等）', status: 'PASSED' },
      { description: '支持点击查看详情', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-003 编辑缺陷',
    description: `## 功能说明
编辑已有缺陷的信息。`,
    userStories: [
      { role: '测试工程师', goal: '更新缺陷信息', benefit: '补充或修正缺陷描述' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 缺陷存在',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['缺陷管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '可以修改缺陷所有字段', status: 'PASSED' },
      { description: '保存成功后显示更新时间', status: 'PASSED' },
      { description: '修改记录可追溯', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-004 缺陷状态流转',
    description: `## 功能说明
管理缺陷的生命周期状态流转。

## 状态流转
\`\`\`
OPEN → IN_PROGRESS → RESOLVED → CLOSED
（可从任意状态重新打开回到 OPEN）
\`\`\``,
    userStories: [
      { role: '测试工程师', goal: '跟踪缺陷处理进度', benefit: '及时了解问题解决状态' },
      { role: '开发工程师', goal: '更新缺陷状态', benefit: '反馈修复进度' },
    ],
    targetUsers: ['TESTER', 'DEVELOPER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在已创建的缺陷',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '缺陷状态可选值：OPEN、IN_PROGRESS、RESOLVED、CLOSED', status: 'PASSED' },
      { description: '状态变更时自动记录变更历史', status: 'PASSED' },
      { description: '支持从任意状态重新打开', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-005 缺陷讨论（评论）',
    description: `## 功能说明
在缺陷下添加评论，支持团队协作讨论问题细节。`,
    userStories: [
      { role: '测试工程师', goal: '在缺陷下添加评论', benefit: '与开发沟通问题细节' },
      { role: '开发工程师', goal: '回复缺陷评论', benefit: '反馈修复方案和进度' },
    ],
    targetUsers: ['TESTER', 'DEVELOPER', 'QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在已创建的缺陷',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '可以添加文字评论', status: 'PASSED' },
      { description: '评论按时间顺序显示', status: 'PASSED' },
      { description: '显示评论者和时间', status: 'PASSED' },
      { description: '支持 @提及用户（V1.1）', status: 'PENDING' },
    ]
  },
  {
    title: 'F-DF-006 批量操作',
    description: `## 功能说明
批量更新缺陷状态或分配者。`,
    userStories: [
      { role: '测试负责人', goal: '批量处理缺陷', benefit: '提高工作效率' },
    ],
    targetUsers: ['QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 选中多个缺陷',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持批量修改状态', status: 'PASSED' },
      { description: '支持批量修改分配者', status: 'PASSED' },
      { description: '批量操作后刷新列表', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-007 缺陷筛选/排序',
    description: `## 功能说明
按条件筛选和排序缺陷列表。`,
    userStories: [
      { role: '测试工程师', goal: '筛选和排序缺陷', benefit: '快速找到目标缺陷' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD', 'DEVELOPER'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['缺陷管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持按状态、严重级、分配者筛选', status: 'PASSED' },
      { description: '支持按创建时间、更新时间排序', status: 'PASSED' },
      { description: '筛选条件可以组合使用', status: 'PASSED' },
    ]
  },
  {
    title: 'F-DF-008 外部系统链接',
    description: `## 功能说明
将内部缺陷与外部系统（JIRA/GitHub Issues）关联。`,
    userStories: [
      { role: '测试工程师', goal: '关联外部 Issue', benefit: '统一管理内外部缺陷' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在已创建的缺陷',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['缺陷管理', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持输入外部 Issue URL', status: 'PENDING' },
      { description: '支持输入外部 Issue ID', status: 'PENDING' },
      { description: '外部链接可点击跳转', status: 'PENDING' },
    ]
  },

  // ========== 模块六：统计分析 ==========
  {
    title: 'F-ST-001 执行状态统计',
    description: `## 功能说明
统计测试计划的执行状态分布，展示 Pass/Fail/Blocked/Untested 比例。`,
    userStories: [
      { role: '测试负责人', goal: '查看执行状态统计', benefit: '了解测试进度' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在已执行的测试计划',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['统计分析', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示执行状态分布饼图', status: 'PASSED' },
      { description: '显示通过率计算', status: 'PASSED' },
      { description: '数据实时更新', status: 'PASSED' },
    ]
  },
  {
    title: 'F-ST-002 计划进度展示',
    description: `## 功能说明
展示测试计划的整体执行进度。`,
    userStories: [
      { role: '测试负责人', goal: '查看计划进度', benefit: '了解测试完成情况' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在测试计划',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['统计分析', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示已执行/总用例数', status: 'PASSED' },
      { description: '显示进度百分比', status: 'PASSED' },
      { description: '支持按计划筛选', status: 'PASSED' },
    ]
  },
  {
    title: 'F-ST-003 缺陷分布统计',
    description: `## 功能说明
统计缺陷的分布情况，按状态和严重级分类。`,
    userStories: [
      { role: '测试负责人', goal: '查看缺陷分布', benefit: '评估项目质量' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在缺陷数据',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['统计分析', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '显示缺陷状态分布', status: 'PASSED' },
      { description: '显示严重级分布', status: 'PASSED' },
      { description: '数据实时更新', status: 'PASSED' },
    ]
  },
  {
    title: 'F-ST-004 报告导出',
    description: `## 功能说明
将测试报告导出为 PDF/HTML 格式，便于分享和存档。`,
    userStories: [
      { role: '测试负责人', goal: '导出测试报告', benefit: '向管理层汇报测试状态' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在可导出的测试数据',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '5d',
    tags: ['统计分析', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持导出 PDF 格式', status: 'PENDING' },
      { description: '支持导出 HTML 格式', status: 'PENDING' },
      { description: '报告包含执行统计和缺陷分布', status: 'PENDING' },
    ]
  },

  // ========== 模块七：系统管理 ==========
  {
    title: 'F-SY-001 用户列表',
    description: `## 功能说明
展示系统中所有用户，显示基本信息和角色。`,
    userStories: [
      { role: '系统管理员', goal: '查看用户列表', benefit: '了解系统用户情况' },
    ],
    targetUsers: ['ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 Admin',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '1d',
    tags: ['系统管理', 'P0', '已完成'],
    priority: 'P0',
    acceptanceCriteria: [
      { description: '显示用户名、邮箱、角色', status: 'PASSED' },
      { description: '支持搜索用户', status: 'PASSED' },
      { description: '显示用户状态', status: 'PASSED' },
    ]
  },
  {
    title: 'F-SY-002 语言切换',
    description: `## 功能说明
支持界面语言切换，目前支持中文和英文。`,
    userStories: [
      { role: '用户', goal: '切换界面语言', benefit: '使用熟悉的语言' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD', 'PM', 'DEVELOPER', 'ADMIN'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['系统管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持中文 (zh)', status: 'PASSED' },
      { description: '支持英文 (en)', status: 'PASSED' },
      { description: '语言偏好保存到用户设置', status: 'PASSED' },
    ]
  },
  {
    title: 'F-SY-003 用户管理（增删改）',
    description: `## 功能说明
管理系统用户，支持添加、编辑、删除用户，设置用户角色。`,
    userStories: [
      { role: '系统管理员', goal: '管理系统用户', benefit: '控制系统访问权限' },
    ],
    targetUsers: ['ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 Admin',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '5d',
    tags: ['系统管理', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '可以创建新用户', status: 'PENDING' },
      { description: '可以编辑用户信息', status: 'PENDING' },
      { description: '可以设置用户角色', status: 'PENDING' },
      { description: '可以禁用/删除用户', status: 'PENDING' },
    ]
  },
  {
    title: 'F-SY-004 主题切换',
    description: `## 功能说明
支持浅色/深色主题切换，提升用户体验。`,
    userStories: [
      { role: '用户', goal: '切换系统主题', benefit: '选择舒适的视觉体验' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD', 'PM', 'DEVELOPER', 'ADMIN'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v2.0.0',
    estimatedEffort: '3d',
    tags: ['系统管理', 'P3', '远期规划'],
    priority: 'P3',
    acceptanceCriteria: [
      { description: '支持浅色主题', status: 'PENDING' },
      { description: '支持深色主题', status: 'PENDING' },
      { description: '主题偏好保存到用户设置', status: 'PENDING' },
    ]
  },

  // ========== 需求管理模块（F-RQ 系列） ==========
  {
    title: 'F-RQ-001 创建需求',
    description: `## 功能说明
产品经理可以在系统中创建内部需求，定义需求标题、描述和验收标准。`,
    userStories: [
      { role: '产品经理', goal: '创建内部需求', benefit: '在系统中管理产品需求' },
    ],
    targetUsers: ['PM', 'ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 PM 或 Admin\n- 已存在至少一个项目',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '需求包含必填字段：标题', status: 'PASSED' },
      { description: '需求包含选填字段：描述、验收标准、优先级、标签', status: 'PASSED' },
      { description: '需求创建后状态为"草稿"', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-002 需求列表',
    description: `## 功能说明
展示项目下所有需求，支持筛选和搜索。`,
    userStories: [
      { role: '产品经理', goal: '查看需求列表', benefit: '了解项目需求概况' },
    ],
    targetUsers: ['PM', 'QA_LEAD', 'ADMIN'],
    preconditions: '- 用户已登录系统',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '显示需求列表，包含标题、状态、优先级', status: 'PASSED' },
      { description: '支持按状态筛选', status: 'PASSED' },
      { description: '支持搜索需求', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-003 编辑需求',
    description: `## 功能说明
编辑已有需求的信息。`,
    userStories: [
      { role: '产品经理', goal: '更新需求信息', benefit: '完善需求描述' },
    ],
    targetUsers: ['PM', 'ADMIN'],
    preconditions: '- 用户已登录系统\n- 需求存在',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '可以修改需求所有字段', status: 'PASSED' },
      { description: '保存成功后显示更新时间', status: 'PASSED' },
      { description: '修改记录可追溯', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-004 需求详情',
    description: `## 功能说明
展示需求的详细信息，包括验收标准和关联的测试用例。`,
    userStories: [
      { role: '产品经理', goal: '查看需求详情', benefit: '了解需求完整信息' },
    ],
    targetUsers: ['PM', 'QA_LEAD', 'TESTER', 'ADMIN'],
    preconditions: '- 用户已登录系统\n- 需求存在',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '显示需求完整信息', status: 'PASSED' },
      { description: '显示验收标准列表', status: 'PASSED' },
      { description: '显示关联的测试用例', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-005 需求状态流转',
    description: `## 功能说明
管理需求的生命周期状态流转。

## 状态流转
DRAFT → PENDING_REVIEW → APPROVED → IN_PROGRESS → COMPLETED`,
    userStories: [
      { role: '产品经理', goal: '管理需求状态', benefit: '跟踪需求进度' },
    ],
    targetUsers: ['PM', 'QA_LEAD', 'ADMIN'],
    preconditions: '- 用户已登录系统\n- 存在已创建的需求',
    businessRules: [
      { code: 'BR-009', description: '需求状态流转：DRAFT → PENDING_REVIEW → APPROVED → IN_PROGRESS → COMPLETED' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '支持需求状态流转', status: 'PASSED' },
      { description: '状态变更有操作按钮', status: 'PASSED' },
      { description: '状态显示对应颜色标识', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-006 关联测试用例',
    description: `## 功能说明
将测试用例与需求关联，建立追溯链。`,
    userStories: [
      { role: '测试工程师', goal: '关联测试用例到需求', benefit: '建立需求-用例追溯链' },
    ],
    targetUsers: ['TESTER', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在需求和测试用例',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P1', '已完成'],
    priority: 'P1',
    acceptanceCriteria: [
      { description: '可以选择用例关联到需求', status: 'PASSED' },
      { description: '支持多对多关联', status: 'PASSED' },
      { description: '关联后显示在需求详情页', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-007 功能验收',
    description: `## 功能说明
产品经理对需求进行验收确认。

## 验收状态
- PENDING：待验收
- ACCEPTED：验收通过
- REJECTED：验收不通过（需填写原因）`,
    userStories: [
      { role: '产品经理', goal: '对需求进行验收', benefit: '确认功能符合预期' },
    ],
    targetUsers: ['PM', 'ADMIN'],
    preconditions: '- 用户已登录系统\n- 用户角色为 PM 或 Admin\n- 存在可验收的需求',
    businessRules: [
      { code: 'BR-010', description: '产品经理有权在任意时刻进行验收，但系统会提示测试完成度' },
      { code: 'BR-011', description: '验收不通过时必须填写原因' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '2d',
    tags: ['需求管理', 'P2', '已完成'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持验收通过/不通过操作', status: 'PASSED' },
      { description: '验收不通过时必须填写原因', status: 'PASSED' },
      { description: '记录验收人和验收时间', status: 'PASSED' },
    ]
  },
  {
    title: 'F-RQ-008 需求追溯视图',
    description: `## 功能说明
可视化展示需求到测试用例的追溯链，包含覆盖率统计。`,
    userStories: [
      { role: '产品经理', goal: '查看需求追溯视图', benefit: '了解测试覆盖情况' },
      { role: '测试负责人', goal: '查看追溯矩阵', benefit: '发现覆盖缺口' },
    ],
    targetUsers: ['PM', 'QA_LEAD'],
    preconditions: '- 用户已登录系统\n- 存在需求和用例关联数据',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['需求管理', 'P2', '已完成'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '显示需求列表和覆盖率', status: 'PASSED' },
      { description: '展开显示关联的测试用例', status: 'PASSED' },
      { description: '未覆盖的需求高亮显示', status: 'PENDING' },
    ]
  },
  {
    title: 'F-RQ-009 追溯矩阵导出',
    description: `## 功能说明
将需求追溯矩阵导出为 Excel 格式。`,
    userStories: [
      { role: '测试负责人', goal: '导出追溯矩阵', benefit: '离线分析和汇报' },
    ],
    targetUsers: ['QA_LEAD', 'PM'],
    preconditions: '- 用户已登录系统\n- 存在可导出的追溯数据',
    businessRules: [],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '3d',
    tags: ['需求管理', 'P2', '待开发'],
    priority: 'P2',
    acceptanceCriteria: [
      { description: '支持导出 Excel 格式', status: 'PENDING' },
      { description: '包含需求、AC、用例、状态信息', status: 'PENDING' },
      { description: '包含覆盖率统计', status: 'PENDING' },
    ]
  },
];

// 电商平台需求数据（保留原有）
const ECOMMERCE_REQUIREMENTS = [
  {
    title: '用户登录功能',
    description: '用户可以使用邮箱和密码登录系统，支持记住登录状态。',
    userStories: [
      { role: '注册用户', goal: '使用邮箱和密码登录系统', benefit: '访问我的个人账户和订单信息' },
      { role: '管理员', goal: '查看用户登录日志', benefit: '监控系统安全和用户活动' },
    ],
    targetUsers: ['TESTER', 'PM', 'DEVELOPER'],
    preconditions: '- 用户已完成注册\n- 用户邮箱已验证\n- 系统认证服务可用',
    businessRules: [
      { code: 'BR-001', description: '密码错误超过5次后账户锁定30分钟' },
      { code: 'BR-002', description: '"记住我"有效期为7天' },
    ],
    designReferences: [
      { type: 'figma', url: 'https://figma.com/file/xxx/login-page', title: '登录页面设计稿' },
    ],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['登录', '认证', '核心功能'],
    acceptanceCriteria: [
      { description: '用户输入正确的邮箱和密码后可以成功登录', status: 'PASSED' },
      { description: '登录失败时显示友好的错误提示', status: 'PASSED' },
      { description: '支持"记住我"功能，7天内免登录', status: 'PENDING' },
    ]
  },
  {
    title: '商品搜索功能',
    description: '用户可以通过关键词搜索商品，支持筛选和排序。',
    userStories: [
      { role: '购物者', goal: '快速搜索到想要的商品', benefit: '节省浏览时间，提高购物效率' },
      { role: '商家', goal: '查看商品搜索热词', benefit: '优化商品标题和关键词' },
    ],
    targetUsers: ['TESTER', 'PM', 'DEVELOPER'],
    preconditions: '- 商品数据已导入\n- 搜索服务可用',
    businessRules: [
      { code: 'BR-005', description: '搜索结果默认按相关性排序' },
      { code: 'BR-006', description: '每页显示20条结果' },
    ],
    designReferences: [
      { type: 'figma', url: 'https://figma.com/file/xxx/search-page', title: '搜索页面设计稿' },
    ],
    targetVersion: 'v1.0.0',
    estimatedEffort: '5d',
    tags: ['搜索', '商品', '核心功能'],
    acceptanceCriteria: [
      { description: '支持关键词模糊搜索', status: 'PASSED' },
      { description: '支持按价格、销量排序', status: 'PENDING' },
      { description: '支持按分类筛选', status: 'PENDING' },
    ]
  },
  {
    title: '购物车功能',
    description: '用户可以将商品添加到购物车，修改数量，删除商品。',
    userStories: [
      { role: '购物者', goal: '将心仪的商品加入购物车', benefit: '统一结算和管理待购商品' },
      { role: '购物者', goal: '修改购物车中商品的数量', benefit: '灵活调整购买计划' },
    ],
    targetUsers: ['TESTER', 'PM'],
    preconditions: '- 用户已登录\n- 商品库存充足',
    businessRules: [
      { code: 'BR-007', description: '单个商品最多加入99件' },
      { code: 'BR-008', description: '购物车商品7天内保留' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['购物车', '核心功能'],
    acceptanceCriteria: [
      { description: '可以添加商品到购物车', status: 'PASSED' },
      { description: '可以修改商品数量', status: 'PASSED' },
      { description: '可以删除购物车商品', status: 'PASSED' },
    ]
  },
  {
    title: '订单支付功能',
    description: '用户可以使用多种支付方式完成订单支付。',
    userStories: [
      { role: '购物者', goal: '选择多种支付方式完成付款', benefit: '使用我最方便的支付渠道' },
      { role: '财务人员', goal: '查看支付流水和对账报表', benefit: '确保资金安全和账目清晰' },
    ],
    targetUsers: ['TESTER', 'PM', 'DEVELOPER'],
    preconditions: '- 订单已创建\n- 支付网关可用',
    businessRules: [
      { code: 'BR-009', description: '支付超时时间为30分钟' },
      { code: 'BR-010', description: '支付成功后自动扣减库存' },
    ],
    designReferences: [
      { type: 'figma', url: 'https://figma.com/file/xxx/payment-page', title: '支付页面设计稿' },
    ],
    targetVersion: 'v1.1.0',
    estimatedEffort: '8d',
    tags: ['支付', '订单', '核心功能'],
    acceptanceCriteria: [
      { description: '支持支付宝支付', status: 'PENDING' },
      { description: '支持微信支付', status: 'PENDING' },
      { description: '支付失败后可以重试', status: 'PENDING' },
    ]
  },
];

// 移动应用需求数据
const MOBILE_APP_REQUIREMENTS = [
  {
    title: '用户注册功能',
    description: '新用户可以通过手机号注册账户，需要验证短信验证码。',
    userStories: [
      { role: '新访客', goal: '快速注册一个账户', benefit: '开始使用App的服务' },
    ],
    targetUsers: ['TESTER', 'PM'],
    preconditions: '- 短信服务可用\n- 用户同意隐私政策',
    businessRules: [
      { code: 'BR-001', description: '验证码有效期5分钟' },
      { code: 'BR-002', description: '同一手机号每天最多发送10次验证码' },
    ],
    designReferences: [],
    targetVersion: 'v1.0.0',
    estimatedEffort: '3d',
    tags: ['注册', '认证'],
    acceptanceCriteria: [
      { description: '用户可以填写手机号接收验证码', status: 'PASSED' },
      { description: '验证码验证成功后完成注册', status: 'PASSED' },
    ]
  },
  {
    title: '推送通知功能',
    description: '系统可以向用户推送消息通知。',
    userStories: [
      { role: '用户', goal: '及时收到重要通知', benefit: '不错过重要信息' },
    ],
    targetUsers: ['TESTER', 'PM'],
    preconditions: '- 用户已开启推送权限',
    businessRules: [
      { code: 'BR-003', description: '用户可以设置免打扰时段' },
    ],
    designReferences: [],
    targetVersion: 'v1.1.0',
    estimatedEffort: '4d',
    tags: ['通知', '推送'],
    acceptanceCriteria: [
      { description: '支持 iOS 推送', status: 'PENDING' },
      { description: '支持 Android 推送', status: 'PENDING' },
    ]
  },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Start seeding ...');

  // Cleanup
  await prisma.testRun.deleteMany();
  await prisma.testPlan.deleteMany();
  await prisma.executionRecord.deleteMany();
  await prisma.testStep.deleteMany();
  await prisma.defectComment.deleteMany();
  await prisma.defect.deleteMany();
  await prisma.internalRequirement.deleteMany(); // Add InternalRequirement cleanup
  await prisma.testCase.deleteMany();
  await prisma.testSuite.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  for (const userData of USERS) {
    await prisma.user.create({ data: userData });
    console.log(`Created user: ${userData.name}`);
  }

  const sarah = USERS.find(u => u.name === 'Sarah Jenkins')!;
  const john = USERS.find(u => u.name === 'John Doe')!;

  for (const projectData of PROJECTS) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        coverImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(projectData.name)}&background=random`,
      }
    });
    console.log(`Created project: ${project.name}`);

    // Create Suites - use NexusQA specific suites for NexusQA project
    const suiteNames = projectData.name === 'NexusQA 产品开发' ? NEXUSQA_SUITES : SUITES;
    const suites: { id: string; name: string }[] = [];
    const suiteMap: Record<string, string> = {}; // name -> id mapping

    for (const suiteName of suiteNames) {
      const suite = await prisma.testSuite.create({
        data: {
          name: suiteName,
          projectId: project.id,
        }
      });
      suites.push(suite);
      suiteMap[suiteName] = suite.id;

      // Create Sub-suites for non-NexusQA projects
      if (projectData.name !== 'NexusQA 产品开发' && Math.random() > 0.5) {
          const subSuite = await prisma.testSuite.create({
              data: {
                  name: `${suiteName} - Advanced`,
                  projectId: project.id,
                  parentId: suite.id
              }
          });
          suites.push(subSuite);
          suiteMap[subSuite.name] = subSuite.id;
      }
    }

    // Create Test Cases - use NexusQA specific test cases
    const testCases: { id: string; title: string; reqIndex?: number }[] = [];

    if (projectData.name === 'NexusQA 产品开发') {
      // Create NexusQA specific test cases
      for (const tcData of NEXUSQA_TEST_CASES) {
        const suiteId = suiteMap[tcData.suite];
        const testCase = await prisma.testCase.create({
          data: {
            title: tcData.title,
            description: `测试用例：${tcData.title}\n\n验证相关功能是否符合需求规格。`,
            preconditions: '- 用户已登录系统\n- 系统处于正常运行状态',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priority: tcData.priority as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: tcData.status as any,
            projectId: project.id,
            suiteId: suiteId,
            authorId: sarah.id,
            assignedToId: randomItem([sarah.id, john.id]),
            steps: {
              create: [
                { action: '准备测试环境和数据', expected: '环境就绪，数据准备完成', order: 1 },
                { action: '执行测试操作', expected: '操作成功执行', order: 2 },
                { action: '验证结果符合预期', expected: '结果与预期一致', order: 3 },
              ]
            }
          }
        });
        testCases.push({ ...testCase, reqIndex: tcData.reqIndex });

        // Create Execution History only for executed test cases
        if (tcData.status !== 'UNTESTED') {
          await prisma.executionRecord.create({
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status: tcData.status as any,
              executedBy: sarah.name,
              testCaseId: testCase.id,
              notes: tcData.status === 'PASSED' ? '测试通过' : (tcData.status === 'FAILED' ? '发现问题，已提交缺陷' : ''),
              date: new Date(Date.now() - Math.floor(Math.random() * 100000000))
            }
          });
        }
      }
    } else {
      // Create generic test cases for other projects
      for (let i = 0; i < 20; i++) {
        const suite = randomItem(suites);
        const testCase = await prisma.testCase.create({
          data: {
            title: `Verify ${suite.name} functionality - Scenario ${i + 1}`,
            description: 'Detailed description of the test scenario...',
            preconditions: 'User must be logged in.',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priority: randomItem(PRIORITIES) as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: randomItem(STATUSES) as any,
            projectId: project.id,
            suiteId: suite.id,
            authorId: sarah.id,
            assignedToId: randomItem([sarah.id, john.id]),
            steps: {
              create: [
                { action: 'Navigate to page', expected: 'Page loads successfully', order: 1 },
                { action: 'Click button', expected: 'Modal opens', order: 2 },
                { action: 'Submit form', expected: 'Success message appears', order: 3 },
              ]
            }
          }
        });
        testCases.push(testCase);

        // Create Execution History
        for (let j = 0; j < 3; j++) {
            await prisma.executionRecord.create({
                data: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: randomItem(STATUSES) as any,
                    executedBy: randomItem([sarah.name, john.name]),
                    testCaseId: testCase.id,
                    notes: 'Automated execution',
                    date: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                }
            });
        }
      }
    }

    // Create Defects
    for (let i = 0; i < 5; i++) {
        await prisma.defect.create({
            data: {
                title: `Bug in ${project.name} - Issue ${i+1}`,
                description: 'Steps to reproduce...',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                severity: randomItem(SEVERITIES) as any,
                status: 'OPEN',
                projectId: project.id,
                authorId: john.id, // Use seeded user ID
                assigneeId: randomItem([sarah.id, john.id]), // Assign to a seeded user
            }
        });
    }

    // Create Test Plan
    const plan = await prisma.testPlan.create({
        data: {
            name: `Release 1.0 Test Plan - ${project.name}`,
            projectId: project.id,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'ACTIVE'
        }
    });

    // Add Test Runs to Plan
    for (const tc of testCases.slice(0, 10)) { // Add first 10 cases to plan
        await prisma.testRun.create({
            data: {
                testPlanId: plan.id,
                testCaseId: tc.id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: randomItem(STATUSES) as any,
                snapshot: JSON.stringify(tc)
            }
        });
    }

    // Select requirements data based on project
    let requirementsData;
    if (projectData.name === 'NexusQA 产品开发') {
      requirementsData = NEXUSQA_REQUIREMENTS;
    } else if (projectData.name === 'E-Commerce Platform') {
      requirementsData = ECOMMERCE_REQUIREMENTS;
    } else {
      requirementsData = MOBILE_APP_REQUIREMENTS;
    }

    // Create Internal Requirements
    for (let i = 0; i < requirementsData.length; i++) {
      const reqData = requirementsData[i];
      // Use priority from data if available, otherwise random
      const reqPriority = (reqData as { priority?: string }).priority || randomItem(PRIORITIES);
      // For NexusQA project, use more realistic status distribution
      let reqStatus: string;
      let acceptanceStatus: string;

      if (projectData.name === 'NexusQA 产品开发') {
        // Based on priority: P0 mostly completed, P1 in progress, P2 draft/pending
        if (reqPriority === 'P0') {
          reqStatus = randomItem(['APPROVED', 'IN_PROGRESS', 'COMPLETED']);
          acceptanceStatus = reqStatus === 'COMPLETED' ? 'ACCEPTED' : 'PENDING';
        } else if (reqPriority === 'P1') {
          reqStatus = randomItem(['APPROVED', 'IN_PROGRESS', 'PENDING_REVIEW']);
          acceptanceStatus = 'PENDING';
        } else {
          reqStatus = randomItem(['DRAFT', 'PENDING_REVIEW']);
          acceptanceStatus = 'PENDING';
        }
      } else {
        reqStatus = randomItem(REQUIREMENT_STATUSES);
        acceptanceStatus = reqStatus === 'COMPLETED'
          ? 'ACCEPTED'
          : (reqStatus === 'DRAFT' ? 'PENDING' : randomItem(ACCEPTANCE_STATUSES));
      }

      // Prepare acceptance criteria with IDs
      const acWithIds = reqData.acceptanceCriteria.map((ac, idx) => ({
        id: `ac-${Date.now()}-${idx}`,
        description: ac.description,
        testCaseIds: [],
        status: ac.status
      }));

      // Prepare business rules with IDs
      const businessRulesWithIds = reqData.businessRules.map((br, idx) => ({
        id: `br-${Date.now()}-${idx}`,
        code: br.code,
        description: br.description
      }));

      // Prepare design references with IDs
      const designRefsWithIds = reqData.designReferences.map((dr, idx) => ({
        id: `dr-${Date.now()}-${idx}`,
        type: dr.type,
        url: dr.url,
        title: dr.title
      }));

      // Prepare user stories with IDs
      const userStoriesWithIds = reqData.userStories.map((us, idx) => ({
        id: `us-${Date.now()}-${idx}`,
        role: us.role,
        goal: us.goal,
        benefit: us.benefit
      }));

      const requirement = await prisma.internalRequirement.create({
        data: {
          title: reqData.title,
          description: reqData.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: reqStatus as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          acceptanceStatus: acceptanceStatus as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: reqPriority as any,
          tags: JSON.stringify(reqData.tags),
          acceptanceCriteria: JSON.stringify(acWithIds),
          // New fields
          userStories: JSON.stringify(userStoriesWithIds),
          targetUsers: JSON.stringify(reqData.targetUsers || []),
          preconditions: reqData.preconditions || null,
          businessRules: JSON.stringify(businessRulesWithIds),
          designReferences: JSON.stringify(designRefsWithIds),
          targetVersion: reqData.targetVersion || null,
          estimatedEffort: reqData.estimatedEffort || null,
          ownerId: sarah.id,
          relatedRequirements: '[]',
          // Project and author
          projectId: project.id,
          authorId: sarah.id,
          acceptedBy: acceptanceStatus !== 'PENDING' ? sarah.id : null,
          acceptedAt: acceptanceStatus !== 'PENDING' ? new Date() : null,
          acceptanceNotes: acceptanceStatus === 'ACCEPTED' ? '需求描述清晰，验收通过' :
                          (acceptanceStatus === 'REJECTED' ? '需要补充更多细节' : null),
          // Link test cases to requirements
          testCases: {
            connect: projectData.name === 'NexusQA 产品开发'
              // For NexusQA: find test cases that have this requirement's index
              ? testCases
                  .filter(tc => tc.reqIndex === i)
                  .map(tc => ({ id: tc.id }))
              // For other projects: cycle through available test cases
              : testCases.length > 0 ? [
                  { id: testCases[i % testCases.length].id },
                  { id: testCases[(i + 1) % testCases.length].id }
                ] : []
          }
        }
      });
      console.log(`Created requirement: ${requirement.title}`);
    }
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
