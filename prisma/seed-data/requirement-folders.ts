// NexusQA Requirement folder hierarchy (Epic → Feature → Requirement)
export const NEXUSQA_REQUIREMENT_FOLDERS = [
  // Epic 1: 核心测试管理
  {
    name: '核心测试管理',
    type: 'EPIC',
    description: '测试管理平台的核心功能，包括用例管理、测试计划和测试执行',
    order: 1,
    children: [
      {
        name: '用例管理',
        type: 'FEATURE',
        description: '测试用例的创建、编辑、AI 生成和评审功能',
        order: 1,
        requirementIndices: [0, 5, 6, 12, 13, 14, 15], // US-001, US-006, US-007, US-013~US-016
      },
      {
        name: '测试计划管理',
        type: 'FEATURE',
        description: '测试计划的创建、复制和管理功能',
        order: 2,
        requirementIndices: [1, 16], // US-002, US-017
      },
      {
        name: '测试执行',
        type: 'FEATURE',
        description: '测试用例执行和结果记录功能',
        order: 3,
        requirementIndices: [2, 17, 18], // US-003, US-018, US-019
      },
    ]
  },
  // Epic 2: 缺陷管理
  {
    name: '缺陷管理',
    type: 'EPIC',
    description: '缺陷的全生命周期管理，包括创建、追踪和讨论',
    order: 2,
    children: [
      {
        name: '内部缺陷管理',
        type: 'FEATURE',
        description: '系统内部的缺陷创建和管理',
        order: 1,
        requirementIndices: [3, 19, 20, 21], // US-004, US-020~US-022
      },
      {
        name: '缺陷集成',
        type: 'FEATURE',
        description: '与外部缺陷系统的集成（Jira, GitHub Issues 等）',
        order: 2,
        requirementIndices: [8], // US-009
      },
    ]
  },
  // Epic 3: 统计分析
  {
    name: '统计分析',
    type: 'EPIC',
    description: '测试进度和质量的统计分析与报告',
    order: 3,
    children: [
      {
        name: '测试进度报告',
        type: 'FEATURE',
        description: '测试执行进度和缺陷分布统计',
        order: 1,
        requirementIndices: [4], // US-005
      },
    ]
  },
  // Epic 4: 需求管理
  {
    name: '需求管理',
    type: 'EPIC',
    description: '内部需求的全生命周期管理',
    order: 4,
    children: [
      {
        name: '需求创建与编辑',
        type: 'FEATURE',
        description: '需求的创建、编辑和验收标准管理',
        order: 1,
        requirementIndices: [9], // US-010
      },
      {
        name: '需求层级结构',
        type: 'FEATURE',
        description: '需求的 Epic/Feature/需求 层级组织',
        order: 2,
        requirementIndices: [22, 23], // 新需求
      },
    ]
  },
  // Epic 5: 项目与团队管理
  {
    name: '项目与团队管理',
    type: 'EPIC',
    description: '项目配置和团队协作功能',
    order: 5,
    children: [
      {
        name: '项目管理',
        type: 'FEATURE',
        description: '项目创建和配置',
        order: 1,
        requirementIndices: [10, 11], // US-011, US-012
      },
    ]
  },
];
