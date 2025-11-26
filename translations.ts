export const translations = {
  en: {
    "app.dashboard": "Dashboard",
    "app.projects": "Projects",
    "app.recent": "Recent",
    "app.settings": "Settings",
    "app.logout": "Logout",
    "app.search": "Search...",
    "app.search_placeholder": "Search test cases...",
    "app.system_online": "System Online",
    
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account preferences and application configuration.",
    "settings.profile": "Profile Information",
    "settings.profile_desc": "Update your personal details.",
    "settings.change_avatar": "Change Avatar",
    "settings.full_name": "Full Name",
    "settings.email": "Email",
    "settings.role": "Role",
    "settings.integrations": "Integrations",
    "settings.integrations_desc": "Connect to external defect tracking systems.",
    "settings.defect_tracker_url": "Defect Tracker Base URL (e.g. Jira)",
    "settings.defect_tracker_hint": "We will append the Bug ID entered during execution to this URL to create clickable links.",
    "settings.preferences": "Preferences",
    "settings.preferences_desc": "Customize your workspace experience.",
    "settings.language": "Language",
    "settings.language_desc": "Select your preferred language for the interface.",
    "settings.email_notifications": "Email Notifications",
    "settings.email_notifications_desc": "Receive daily summaries of test execution results.",
    
    "role.ADMIN": "Admin",
    "role.QA_LEAD": "QA Lead",
    "role.TESTER": "Tester"
  },
  zh: {
    "app.dashboard": "仪表盘",
    "app.projects": "项目列表",
    "app.recent": "最近访问",
    "app.settings": "设置",
    "app.logout": "退出登录",
    "app.search": "搜索...",
    "app.search_placeholder": "搜索测试用例...",
    "app.system_online": "系统在线",

    "settings.title": "设置",
    "settings.subtitle": "管理您的账户偏好和应用程序配置。",
    "settings.profile": "个人信息",
    "settings.profile_desc": "更新您的个人详细信息。",
    "settings.change_avatar": "更改头像",
    "settings.full_name": "全名",
    "settings.email": "电子邮箱",
    "settings.role": "角色",
    "settings.integrations": "集成",
    "settings.integrations_desc": "连接到外部缺陷跟踪系统。",
    "settings.defect_tracker_url": "缺陷跟踪器基础 URL (例如 Jira)",
    "settings.defect_tracker_hint": "我们将把执行期间输入的缺陷 ID 附加到此 URL 以创建可点击的链接。",
    "settings.preferences": "偏好设置",
    "settings.preferences_desc": "自定义您的工作区体验。",
    "settings.language": "语言",
    "settings.language_desc": "选择界面的首选语言。",
    "settings.email_notifications": "邮件通知",
    "settings.email_notifications_desc": "接收测试执行结果的每日摘要。",

    "role.ADMIN": "管理员",
    "role.QA_LEAD": "QA 负责人",
    "role.TESTER": "测试人员"
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
