// NexusQA Requirement folder hierarchy (Epic → Feature → Requirement)
// Requirement indices based on seed order:
// 0-9: US-001 ~ US-010 (用户故事)
// 10-15: F-PM-001 ~ F-PM-006 (项目管理)
// 16-29: F-TC-001 ~ F-TC-014 (用例管理)
// 30-38: F-TP-001 ~ F-TP-009 (测试计划)
// 39-43: F-TE-001 ~ F-TE-005 (测试执行)
// 44-51: F-DF-001 ~ F-DF-008 (缺陷管理)
// 52-55: F-ST-001 ~ F-ST-004 (统计分析)
// 56-59: F-SY-001 ~ F-SY-004 (系统设置)
// 60-71: F-RQ-001 ~ F-RQ-012 (需求管理) - 新增 F-RQ-010~012

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
        // US-001(0), US-006(5), US-007(6), F-TC-001~F-TC-014(16-29)
        requirementIndices: [0, 5, 6, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      },
      {
        name: '测试计划管理',
        type: 'FEATURE',
        description: '测试计划的创建、复制和管理功能',
        order: 2,
        // US-002(1), F-TP-001~F-TP-009(30-38)
        requirementIndices: [1, 30, 31, 32, 33, 34, 35, 36, 37, 38],
      },
      {
        name: '测试执行',
        type: 'FEATURE',
        description: '测试用例执行和结果记录功能',
        order: 3,
        // US-003(2), F-TE-001~F-TE-005(39-43)
        requirementIndices: [2, 39, 40, 41, 42, 43],
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
        // US-004(3), F-DF-001~F-DF-007(44-50)
        requirementIndices: [3, 44, 45, 46, 47, 48, 49, 50],
      },
      {
        name: '缺陷集成',
        type: 'FEATURE',
        description: '与外部缺陷系统的集成（Jira, GitHub Issues 等）',
        order: 2,
        // F-DF-008(51)
        requirementIndices: [51],
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
        // US-005(4), F-ST-001~F-ST-004(52-55)
        requirementIndices: [4, 52, 53, 54, 55],
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
        // US-008(7), US-009(8), F-RQ-001~F-RQ-004(60-63)
        requirementIndices: [7, 8, 60, 61, 62, 63],
      },
      {
        name: '需求状态与追溯',
        type: 'FEATURE',
        description: '需求状态流转、验收和追溯功能',
        order: 2,
        // US-010(9), F-RQ-005~F-RQ-009(64-68), F-RQ-010(69)
        requirementIndices: [9, 64, 65, 66, 67, 68, 69],
      },
      {
        name: '需求层级与文件夹',
        type: 'FEATURE',
        description: '需求层级结构和文件夹管理功能',
        order: 3,
        // F-RQ-011(70), F-RQ-012(71)
        requirementIndices: [70, 71],
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
        // F-PM-001~F-PM-006(10-15)
        requirementIndices: [10, 11, 12, 13, 14, 15],
      },
      {
        name: '系统设置',
        type: 'FEATURE',
        description: '用户管理、语言和主题设置',
        order: 2,
        // F-SY-001~F-SY-004(56-59)
        requirementIndices: [56, 57, 58, 59],
      },
    ]
  },
];
