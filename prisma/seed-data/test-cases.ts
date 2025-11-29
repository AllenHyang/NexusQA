// NexusQA specific test cases with requirement mapping
export const NEXUSQA_TEST_CASES = [
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

  // ========== 补充测试用例 - 覆盖 index 32+ 的需求 ==========
  // F-TC-012 用例复制 (index: 32)
  { suite: '测试用例管理', title: 'TC-TC-015 验证用例复制功能', priority: 'P2', status: 'UNTESTED', reqIndex: 32 },
  { suite: '测试用例管理', title: 'TC-TC-016 验证复制后标题后缀', priority: 'P2', status: 'UNTESTED', reqIndex: 32 },

  // F-TC-013 用例导入 (index: 33)
  { suite: '测试用例管理', title: 'TC-TC-017 验证Excel用例导入', priority: 'P2', status: 'UNTESTED', reqIndex: 33 },

  // F-TC-014 用例导出 (index: 34)
  { suite: '测试用例管理', title: 'TC-TC-018 验证Excel用例导出', priority: 'P2', status: 'UNTESTED', reqIndex: 34 },

  // F-TP-001 创建计划 (index: 35)
  { suite: '测试计划管理', title: 'TC-TP-005 验证计划创建表单', priority: 'P0', status: 'PASSED', reqIndex: 35 },

  // F-TP-002 计划列表 (index: 36)
  { suite: '测试计划管理', title: 'TC-TP-006 验证计划列表展示', priority: 'P0', status: 'PASSED', reqIndex: 36 },

  // F-TP-003 添加用例到计划 (index: 37)
  { suite: '测试计划管理', title: 'TC-TP-007 验证批量添加用例', priority: 'P0', status: 'PASSED', reqIndex: 37 },

  // F-TP-004 从计划移除用例 (index: 38)
  { suite: '测试计划管理', title: 'TC-TP-008 验证移除计划用例', priority: 'P0', status: 'PASSED', reqIndex: 38 },

  // F-TP-005 计划执行页面 (index: 39)
  { suite: '测试计划管理', title: 'TC-TP-009 验证计划执行页面', priority: 'P0', status: 'PASSED', reqIndex: 39 },

  // F-TP-006 计划进度统计 (index: 40)
  { suite: '测试计划管理', title: 'TC-TP-010 验证进度统计显示', priority: 'P0', status: 'PASSED', reqIndex: 40 },

  // F-TP-007 计划复制 (index: 41)
  { suite: '测试计划管理', title: 'TC-TP-011 验证计划复制详情', priority: 'P1', status: 'PASSED', reqIndex: 41 },

  // F-TP-008 编辑计划 (index: 42)
  { suite: '测试计划管理', title: 'TC-TP-012 验证编辑计划信息', priority: 'P1', status: 'PASSED', reqIndex: 42 },

  // F-TP-009 删除计划 (index: 43)
  { suite: '测试计划管理', title: 'TC-TP-013 验证删除计划操作', priority: 'P1', status: 'PASSED', reqIndex: 43 },

  // F-TE-001 执行用例 (index: 44)
  { suite: '测试执行', title: 'TC-TE-007 验证执行用例标记', priority: 'P0', status: 'PASSED', reqIndex: 44 },

  // F-TE-002 执行备注 (index: 45)
  { suite: '测试执行', title: 'TC-TE-008 验证执行备注保存', priority: 'P0', status: 'PASSED', reqIndex: 45 },

  // F-TE-003 关联缺陷 (index: 46)
  { suite: '测试执行', title: 'TC-TE-009 验证关联缺陷功能', priority: 'P0', status: 'PASSED', reqIndex: 46 },

  // F-TE-004 执行历史 (index: 47)
  { suite: '测试执行', title: 'TC-TE-010 验证执行历史记录', priority: 'P0', status: 'PASSED', reqIndex: 47 },

  // F-TE-005 证据附件上传 (index: 48)
  { suite: '测试执行', title: 'TC-TE-011 验证证据上传功能', priority: 'P2', status: 'UNTESTED', reqIndex: 48 },

  // F-DF-001 创建缺陷 (index: 49)
  { suite: '缺陷管理', title: 'TC-DF-008 验证缺陷创建表单', priority: 'P0', status: 'PASSED', reqIndex: 49 },

  // F-DF-002 缺陷列表 (index: 50)
  { suite: '缺陷管理', title: 'TC-DF-009 验证缺陷列表展示', priority: 'P0', status: 'PASSED', reqIndex: 50 },

  // F-DF-003 编辑缺陷 (index: 51)
  { suite: '缺陷管理', title: 'TC-DF-010 验证缺陷编辑功能', priority: 'P0', status: 'PASSED', reqIndex: 51 },

  // F-DF-004 缺陷状态流转 (index: 52)
  { suite: '缺陷管理', title: 'TC-DF-011 验证状态流转功能', priority: 'P0', status: 'PASSED', reqIndex: 52 },

  // F-DF-005 缺陷讨论 (index: 53)
  { suite: '缺陷管理', title: 'TC-DF-012 验证缺陷评论功能', priority: 'P1', status: 'PASSED', reqIndex: 53 },

  // F-DF-006 批量操作 (index: 54)
  { suite: '缺陷管理', title: 'TC-DF-013 验证批量修改状态', priority: 'P1', status: 'PASSED', reqIndex: 54 },

  // F-DF-007 缺陷筛选/排序 (index: 55)
  { suite: '缺陷管理', title: 'TC-DF-014 验证缺陷筛选排序', priority: 'P1', status: 'PASSED', reqIndex: 55 },

  // F-DF-008 外部系统链接 (index: 56)
  { suite: '缺陷管理', title: 'TC-DF-015 验证外部链接功能', priority: 'P2', status: 'UNTESTED', reqIndex: 56 },

  // F-ST-001 执行状态统计 (index: 57)
  { suite: '统计分析', title: 'TC-ST-005 验证执行统计准确', priority: 'P0', status: 'PASSED', reqIndex: 57 },

  // F-ST-002 计划进度报告 (index: 58)
  { suite: '统计分析', title: 'TC-ST-006 验证进度报告内容', priority: 'P1', status: 'PASSED', reqIndex: 58 },

  // F-ST-003 缺陷分布统计 (index: 59)
  { suite: '统计分析', title: 'TC-ST-007 验证缺陷分布图表', priority: 'P1', status: 'PASSED', reqIndex: 59 },

  // F-ST-004 导出报告 (index: 60)
  { suite: '统计分析', title: 'TC-ST-008 验证报告导出功能', priority: 'P2', status: 'UNTESTED', reqIndex: 60 },

  // F-RQ-001 创建需求 (index: 61)
  { suite: '需求管理', title: 'TC-RQ-013 验证需求创建功能', priority: 'P0', status: 'PASSED', reqIndex: 61 },

  // F-RQ-002 需求列表 (index: 62)
  { suite: '需求管理', title: 'TC-RQ-014 验证需求列表展示', priority: 'P0', status: 'PASSED', reqIndex: 62 },

  // F-RQ-003 编辑需求 (index: 63)
  { suite: '需求管理', title: 'TC-RQ-015 验证需求编辑保存', priority: 'P0', status: 'PASSED', reqIndex: 63 },

  // F-RQ-004 需求详情 (index: 64)
  { suite: '需求管理', title: 'TC-RQ-016 验证需求详情页面', priority: 'P0', status: 'PASSED', reqIndex: 64 },

  // F-RQ-005 需求状态管理 (index: 65)
  { suite: '需求管理', title: 'TC-RQ-017 验证需求状态变更', priority: 'P0', status: 'PASSED', reqIndex: 65 },

  // F-RQ-006 验收标准管理 (index: 66)
  { suite: '需求管理', title: 'TC-RQ-018 验证验收标准编辑', priority: 'P0', status: 'PASSED', reqIndex: 66 },

  // F-RQ-007 关联测试用例 (index: 67)
  { suite: '需求管理', title: 'TC-RQ-019 验证用例关联功能', priority: 'P0', status: 'PASSED', reqIndex: 67 },

  // F-RQ-008 功能验收 (index: 68)
  { suite: '需求管理', title: 'TC-RQ-020 验证功能验收操作', priority: 'P1', status: 'PASSED', reqIndex: 68 },

  // F-RQ-009 需求评审 (index: 69)
  { suite: '需求管理', title: 'TC-RQ-021 验证需求评审流程', priority: 'P1', status: 'PASSED', reqIndex: 69 },

  // F-RQ-010 追溯矩阵视图 (index: 70)
  { suite: '需求管理', title: 'TC-RQ-022 验证追溯矩阵展示', priority: 'P1', status: 'PASSED', reqIndex: 70 },

  // F-RQ-011 需求筛选/搜索 (index: 71)
  { suite: '需求管理', title: 'TC-RQ-023 验证需求搜索功能', priority: 'P1', status: 'PASSED', reqIndex: 71 },

  // F-RQ-012 需求导入 (index: 72)
  { suite: '需求管理', title: 'TC-RQ-024 验证需求导入功能', priority: 'P2', status: 'UNTESTED', reqIndex: 72 },

  // F-RQ-013 需求导出 (index: 73)
  { suite: '需求管理', title: 'TC-RQ-025 验证需求导出功能', priority: 'P2', status: 'UNTESTED', reqIndex: 73 },
];

// Constants for random data generation
export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
export const STATUSES = ['UNTESTED', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'];
export const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const REQUIREMENT_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];
export const ACCEPTANCE_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'];
