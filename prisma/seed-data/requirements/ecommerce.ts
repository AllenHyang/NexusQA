// E-Commerce Platform requirements data
export const ECOMMERCE_REQUIREMENTS = [
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
