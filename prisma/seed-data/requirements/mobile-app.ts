// Mobile App requirements data
export const MOBILE_APP_REQUIREMENTS = [
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
