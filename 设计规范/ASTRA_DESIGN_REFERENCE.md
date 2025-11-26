# Astra Security Platform - 设计参考文档

> 从 Astra 安全扫描平台 UI 截图提取的设计规范，作为项目参考

---

## 一、整体布局结构

### 1.1 页面布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  顶部导航栏 (Top Navigation)                                          │
├────────────┬────────────────────────────────────┬───────────────────┤
│            │                                    │                   │
│  左侧边栏   │        主内容区域                    │    右侧面板       │
│  (240px)   │        (Main Content)              │    (Progress)     │
│            │                                    │    (~280px)       │
│            │                                    │                   │
└────────────┴────────────────────────────────────┴───────────────────┘
```

### 1.2 布局特点

- **三栏布局**: 左侧导航 + 中间内容 + 右侧进度面板
- **固定侧边栏**: 左右侧边栏固定，中间内容区滚动
- **面包屑导航**: 顶部有层级导航（← Back / Manual Pentests / Full App Scanning）

### 1.3 顶部导航栏

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back  /  Manual Pentests  /  Full App Scanning     📄Docs  ❓Help  ⚙Manage Targets  [▶ Start a Scan] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**组成元素**:
- **返回按钮**: `← Back` 带左箭头
- **面包屑**: 用 `/` 分隔，当前页面高亮
- **右侧操作区**:
  - Docs 按钮（文档图标）
  - Help 按钮（问号图标）
  - Manage Targets（齿轮图标）
  - Start a Scan（主要CTA，蓝色背景，播放图标）

---

## 二、色彩系统

### 2.1 主色调

| 颜色名称      | HEX 值      | 用途                    |
| ------------ | ----------- | ----------------------- |
| 背景色        | `#FFFFFF`   | 页面主背景               |
| 侧边栏背景    | `#FAFAFA`   | 左侧导航背景             |
| 品牌蓝       | `#2563EB`   | 链接、主操作按钮          |
| 强调橙       | `#F97316`   | CTA按钮(Get Help)        |
| 进度条黄     | `#FCD34D`   | 进度指示、ETA标签         |

### 2.2 状态色系

#### 严重程度（Severity）

| 级别      | 背景色          | 文字色          | 示例     |
| --------- | --------------- | --------------- | -------- |
| Critical  | `#FEE2E2`       | `#DC2626`       | 红色背景 |
| High      | `#FEF3C7`       | `#D97706`       | 橙黄背景 |
| Medium    | `#FEF9C3`       | `#CA8A04`       | 黄色背景 |
| Low       | `#DCFCE7`       | `#16A34A`       | 绿色背景 |

#### 漏洞状态（Vulnerability Status）

| 状态         | 颜色指示       | 说明            |
| ------------ | -------------- | --------------- |
| Draft        | 灰色圆点 `●`   | 草稿状态         |
| Unsolved     | 蓝色圆点 `●`   | 未解决           |
| Under Review | 黄色圆点 `●`   | 审核中           |
| Need Help    | 红色圆点 `●`   | 需要帮助         |
| Solved       | 绿色圆点 `●`   | 已解决           |

### 2.3 文字色系

```
主标题:       #18181B (zinc-900)
正文文本:     #3F3F46 (zinc-700)
次级文本:     #71717A (zinc-500)
占位符:       #A1A1AA (zinc-400)
链接文字:     #2563EB (blue-600)
```

### 2.4 边框与分割线

```
边框色:       #E5E7EB (gray-200)
分割线:       #F3F4F6 (gray-100)
卡片边框:     #E5E7EB (gray-200)
```

---

## 三、字体排版

### 3.1 字体家族

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 字号层级

| 层级          | 字号    | 字重  | 用途               |
| ------------- | ------- | ----- | ------------------ |
| 页面标题       | 24px    | 600   | Full App Scanning  |
| 卡片标题       | 14px    | 600   | Vulnerabilities    |
| 正文          | 14px    | 400   | 列表项文本          |
| 小文本        | 12px    | 500   | 标签、日期          |
| 极小文本      | 10px    | 600   | 徽章文字            |

---

## 四、组件规范

### 4.1 页面标题区域（Page Header）

```
┌──────────────────────────────────────────────────────────────────┐
│  🔒 Full App Scanning                                            │
│  ● In Progress  ·  #e214  ·  Started: 13 Oct, 2023               │
└──────────────────────────────────────────────────────────────────┘
```

**样式特征**:
- 页面图标: 锁形图标，表示安全扫描
- 标题: `24px` 字重 `600`
- 状态徽章: 黄色圆点 + 黄色文字 `In Progress`
- 编号: 灰色 `#e214`
- 日期: 灰色 `Started: 13 Oct, 2023`
- 分隔符: 中点 `·`

```jsx
// 页面状态徽章
<span className="inline-flex items-center gap-1.5 text-sm">
  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
  <span className="text-yellow-600 font-medium">In Progress</span>
</span>

// 元信息
<span className="text-gray-400 text-sm">#e214</span>
<span className="text-gray-400 text-sm">·</span>
<span className="text-gray-400 text-sm">Started: 13 Oct, 2023</span>
```

### 4.2 统计卡片（Stats Card）

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ > Vulnerab...   │  │ > High Severity │  │ > Potential...  │  │
│  │   Unsolved      │  │   Vulnerabilities│  │   Loss Saved   │  │
│  │                 │  │                 │  │                 │  │
│  │      9          │  │       3         │  │   $289.00       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**样式特征**:
- 背景: `#FEF9C3` (淡黄色)
- 边框圆角: `12px`
- 内边距: `16px`
- 数字字号: `32px` / 字重: `700`
- 标签字号: `12px` / 字重: `500`
- 带有 `>` 图标装饰（橙色/黄色渐变箭头）

```jsx
// 统计卡片组件
<div className="bg-amber-50 rounded-xl p-4 flex-1">
  <div className="flex items-start gap-2">
    <span className="text-amber-500 text-lg">›</span>
    <div>
      <p className="text-xs text-gray-500 font-medium">Vulnerabilities Unsolved</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">9</p>
    </div>
  </div>
</div>
```

### 4.3 严重程度徽章（Severity Badge）

```jsx
// Critical
<span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded text-xs font-semibold">
  Critical
</span>

// High
<span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded text-xs font-semibold">
  High
</span>

// Medium
<span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded text-xs font-semibold">
  Medium
</span>

// Low
<span className="bg-green-100 text-green-600 px-2.5 py-0.5 rounded text-xs font-semibold">
  Low
</span>
```

**样式特征**:
- 圆角: `4px`
- 内边距: `px-2.5 py-0.5`
- 字号: `12px`
- 字重: `600`

### 4.4 状态指示器（Status Indicator）

```jsx
// 带分组标题的状态指示
<div className="flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
  <span className="text-sm font-medium text-gray-700">Draft</span>
  <span className="text-sm text-gray-400">2</span>
</div>
```

### 4.5 漏洞列表行（Vulnerability Row）

```
┌──────────────────────────────────────────────────────────────────────┐
│  #8793  [Critical]  Server Side Template Injection  22 Jan, 12:11 PM │
│                                                        ⚡ 8.3  ✓  ⚙  │
└──────────────────────────────────────────────────────────────────────┘
```

**样式特征**:
- 行高: `52px`
- 左侧 ID: 灰色等宽字体
- 徽章: 见4.2
- 描述文字: `14px` 常规字重
- 时间戳: `12px` 灰色
- CVSS分数: 带闪电图标，`⚡ 8.3`

### 4.6 进度面板（Progress Panel）

```
┌─────────────────────────────────────────┐
│  Progress ⓘ           [ETA Friday] 33% │
├─────────────────────────────────────────┤
│  ✓ Starting Scan                        │
│  ○ Vulnerability Scan              20%  │
│    ├── ✓ Connectivity Check             │
│    ├── ✓ Crawling                       │
│    ├── ✓ Passive                        │
│    ├── ○ Active                         │
│    └── ○ Emerging Threats               │
│  ○ Penetration Testing                  │
│  ○ Bugs Verified                        │
│  ○ Bugs Reported                        │
│  ─────────────────────                  │
│  ○ Re-Scan                              │
│  ○ Certificate Awarded                  │
└─────────────────────────────────────────┘
```

**样式特征**:
- 背景: 白色卡片
- 阴影: `shadow-sm`
- 圆角: `12px`
- 进度条: 黄色 `#FCD34D`
- ETA标签: 黄色背景圆角徽章 `bg-yellow-100 text-yellow-700`
- 完成项: 绿色勾选 `✓` 配绿色圆形背景
- 进行中: 浅蓝色圆圈带进度百分比
- 分割线: 用于区分主流程和附加流程

```jsx
// 进度面板头部
<div className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center gap-2">
    <span className="font-semibold text-gray-900">Progress</span>
    <span className="text-gray-400 cursor-help">ⓘ</span>
  </div>
  <div className="flex items-center gap-2">
    <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
      ETA Friday
    </span>
    {/* 圆形进度环 */}
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10 -rotate-90">
        <circle cx="20" cy="20" r="16" stroke="#E5E7EB" strokeWidth="3" fill="none" />
        <circle cx="20" cy="20" r="16" stroke="#FCD34D" strokeWidth="3" fill="none"
          strokeDasharray="100" strokeDashoffset="67" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">33%</span>
    </div>
  </div>
</div>

// 进度项 - 完成状态
<div className="flex items-center gap-3 py-2">
  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
    <span className="text-green-600 text-xs">✓</span>
  </div>
  <span className="text-sm text-gray-500 line-through">Starting Scan</span>
</div>

// 进度项 - 进行中状态
<div className="flex items-center gap-3 py-2">
  <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
  </div>
  <span className="text-sm text-blue-600 font-medium">Vulnerability Scan</span>
  <span className="ml-auto text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">20%</span>
</div>

// 子任务缩进
<div className="ml-8 flex items-center gap-3 py-1.5">
  <span className="text-green-500 text-sm">✓</span>
  <span className="text-sm text-gray-500">Connectivity Check</span>
</div>
```

### 4.7 帮助卡片（Help Card）

```
┌─────────────────────────────────────────────────────────┐
│  Auditors (3)  👤👤👤    Need More Help?   [Get Help]   │
│                         Request a call with our team    │
└─────────────────────────────────────────────────────────┘
```

**样式特征**:
- 左侧: Auditors 头像堆叠
- 右侧: 帮助提示 + CTA 按钮

```jsx
<div className="flex items-center justify-between py-4 border-t border-gray-100">
  {/* 审计员 */}
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-600">Auditors (3)</span>
    <div className="flex -space-x-2">
      <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
      <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
      <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
    </div>
  </div>

  {/* 帮助区域 */}
  <div className="flex items-center gap-4">
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">Need More Help?</p>
      <p className="text-xs text-gray-500">Request a call with our team</p>
    </div>
    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
      Get Help
    </button>
  </div>
</div>
```

### 4.8 聊天消息卡片（Chat Message）

```
┌─────────────────────────────────────────┐
│  [Avatar] Abhishek Kukreti    2h ago   │
│  Hey Ananda, We'll notify you once...  │
│  [Chat with us] (蓝色链接)              │
└─────────────────────────────────────────┘
```

**样式特征**:
- 头像: `40px` 圆形
- 名称: `14px` 字重 `600`
- 时间: `12px` 灰色
- 消息: `14px` 灰色文本
- 链接: 蓝色 `#2563EB`

```jsx
<div className="bg-gray-50 rounded-xl p-4">
  <div className="flex gap-3">
    <img className="w-10 h-10 rounded-full" src="avatar.jpg" />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">Abhishek Kukreti</span>
        <span className="text-xs text-gray-400">2h ago</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Hey Ananda, We'll notify you once your scan results are ready.
      </p>
      <a href="#" className="text-sm text-blue-600 font-medium mt-2 inline-block hover:underline">
        Chat with us
      </a>
    </div>
  </div>
</div>
```

### 4.9 按钮样式

#### 主要按钮（Primary - 蓝色）

```jsx
<button className="
  bg-blue-600 text-white
  px-4 py-2 rounded-lg
  text-sm font-medium
  hover:bg-blue-700
  transition-colors
">
  ▶ Start a Scan
</button>
```

#### CTA 按钮（橙色）

```jsx
<button className="
  bg-orange-500 text-white
  px-4 py-2 rounded-lg
  text-sm font-medium
  hover:bg-orange-600
  transition-colors
">
  Get Help
</button>
```

#### 次级按钮（白色边框）

```jsx
<button className="
  bg-white text-gray-700
  border border-gray-200
  px-4 py-2 rounded-lg
  text-sm font-medium
  hover:bg-gray-50
  transition-colors
">
  Manage Targets
</button>
```

### 4.10 可折叠面板（Collapsible Panel）

```
┌─────────────────────────────────────────┐
│  Grades                              ⌄  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Vulnerability Severity        ⟳    ⌄  │
└─────────────────────────────────────────┘
```

**样式特征**:
- 标题: `14px` 字重 `500`
- 右侧图标: 展开/折叠箭头 `⌄`
- 可带加载状态: 旋转刷新图标 `⟳`
- 点击展开显示内容

```jsx
// 可折叠面板
<div className="border-t border-gray-100">
  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
    <span className="text-sm font-medium text-gray-900">Grades</span>
    <svg className="w-4 h-4 text-gray-400 transition-transform" /* rotate on expand */>
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
  {/* 展开内容 */}
</div>

// 带加载状态
<div className="flex items-center gap-2">
  <span className="text-sm font-medium">Vulnerability Severity</span>
  <svg className="w-4 h-4 text-gray-400 animate-spin">...</svg>
</div>
```

### 4.11 列表行操作图标（Row Actions）

```jsx
// 验证状态图标
<div className="flex items-center gap-2">
  <span className="text-blue-500">✓</span>  {/* 已验证 */}
  <button className="p-1 hover:bg-gray-100 rounded">
    <svg className="w-4 h-4 text-gray-400">⚙</svg>  {/* 设置 */}
  </button>
</div>
```

**图标说明**:
- ✓ 蓝色勾选: 已验证状态
- ⚙ 齿轮图标: 更多设置/操作

---

## 五、侧边栏导航

### 5.1 导航结构

```
┌────────────────────────┐
│  astra                 │  <- Logo
├────────────────────────┤
│  🚀 Get Started        │  <- 引导项
│  📊 Dashboard          │
│  🎯 Targets            │
├────────────────────────┤
│  ┌ 2 WORKSPACES       │  <- 分组标题
│  │  └ 5 Targets ⌄     │
│  ├────────────────────│
│  │ ● Manual Pentests  │  <- 活跃项（蓝色背景）
│  │   Vulnerabilities  │
│  │   Certificates     │
│  │ ⚡ Continuous Scan  │
│  └────────────────────│
├────────────────────────┤
│  📋 Reports            │
│  ✓ Compliance          │
│  🔗 Integrations       │
│  ⚡ Automation          │
│  🕸 Security Graph      │
│  📦 Inventory          │
└────────────────────────┘
```

### 5.2 工作区选择器（Workspace Selector）

```
┌────────────────────────────────────┐
│  🏢  2 WORKSPACES                 │
│  ●+2  5 Targets              ⌄    │
└────────────────────────────────────┘
```

**样式特征**:
- 带图标的分组标题
- 显示工作区数量和目标数量
- 下拉箭头表示可展开
- 左侧有彩色圆点指示器（堆叠样式）

```jsx
// 工作区选择器
<div className="px-3 py-2 mb-2">
  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
    <span>🏢</span>
    <span>2 WORKSPACES</span>
  </div>
  <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
    <div className="flex items-center gap-2">
      {/* 堆叠的彩色圆点 */}
      <div className="flex -space-x-1">
        <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
        <span className="w-3 h-3 rounded-full bg-orange-500 border border-white"></span>
        <span className="w-3 h-3 rounded-full bg-gray-300 border border-white text-[8px] flex items-center justify-center">+2</span>
      </div>
      <span className="text-sm font-medium text-gray-700">5 Targets</span>
    </div>
    <svg className="w-4 h-4 text-gray-400">⌄</svg>
  </button>
</div>
```

### 5.3 导航项样式

```jsx
// 普通项
<div className="
  flex items-center gap-3
  px-3 py-2.5 rounded-lg
  text-gray-600 text-sm font-medium
  hover:bg-gray-100
  transition-colors cursor-pointer
">
  <Icon className="w-5 h-5" />
  <span>Dashboard</span>
</div>

// 活跃项
<div className="
  flex items-center gap-3
  px-3 py-2.5 rounded-lg
  bg-blue-50 text-blue-700 text-sm font-semibold
  cursor-pointer
">
  <Icon className="w-5 h-5 text-blue-600" />
  <span>Manual Pentests</span>
</div>

// 子导航项（缩进）
<div className="
  flex items-center gap-3
  px-3 py-2 ml-4
  text-gray-500 text-sm font-medium
  hover:text-gray-700
  transition-colors cursor-pointer
">
  <span>Vulnerabilities</span>
</div>
```

---

## 六、搜索与筛选栏

```
┌─────────────────────────────────────────────────────────────────────┐
│  [🔍 Search by scan name...]  [↑↓ Sort By]  [⊕ Status]  [⊕ Severity]│
│                                              [⊕ Assigned To]        │
└─────────────────────────────────────────────────────────────────────┘
```

**样式特征**:
- 搜索框: 灰色背景 `#F3F4F6`，圆角 `8px`
- 筛选按钮: 白色背景，灰色边框，带下拉箭头
- 间距: `gap-3`

---

## 七、数据展示组件

### 7.1 分组列表（Grouped List）

```
● Draft  2                                    ••• +
├─ #8793  [Critical]  Server Side Template...
└─ #8793  [Medium]    PII Disclosure...

● Unsolved  1                                 ••• +
└─ #8793  [Low]       .svn/entries Found...

● Under Review  2                             ••• +
├─ #8793  [High]      JSON Web Key Set...
└─ #8793  [Medium]    WordPress Database...
```

**样式特征**:
- 分组标题: 带状态圆点和计数
- 右侧操作: `...` 更多菜单 + `+` 添加按钮
- 展开/折叠: 可折叠的分组

### 7.2 CVSS 分数展示

```jsx
<div className="flex items-center gap-1.5 text-sm text-gray-600">
  <span className="text-yellow-500">⚡</span>
  <span className="font-semibold">8.3</span>
</div>
```

### 7.3 Auditors 头像组

```jsx
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">Auditors (3)</span>
  <div className="flex -space-x-2">
    <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
    <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
    <img className="w-8 h-8 rounded-full border-2 border-white" src="..." />
  </div>
</div>
```

---

## 八、圆角规范

| 元素类型      | 圆角值   | Tailwind     |
| ------------ | -------- | ------------ |
| 按钮         | 8px      | `rounded-lg` |
| 卡片         | 12px     | `rounded-xl` |
| 徽章         | 4px      | `rounded`    |
| 输入框       | 8px      | `rounded-lg` |
| 头像         | 50%      | `rounded-full` |
| 进度面板     | 12px     | `rounded-xl` |

---

## 九、间距规范

### 9.1 页面间距

```
页面左右边距:    24px
侧边栏宽度:      240px
内容区域间距:    24px
卡片内边距:      16px - 24px
```

### 9.2 组件间距

```
列表项间距:      0 (紧凑)
分组间距:        16px
徽章与文字间距:   8px
图标与文字间距:   8px - 12px
```

---

## 十、交互状态

### 10.1 悬停效果

```jsx
// 列表行悬停
className="hover:bg-gray-50 transition-colors"

// 按钮悬停
className="hover:bg-blue-700 transition-colors"

// 导航项悬停
className="hover:bg-gray-100 transition-colors"
```

### 10.2 加载状态

- 进度环动画
- 骨架屏加载
- 刷新图标旋转 `⟳`

---

## 十一、与 NexusQA 设计对比

| 特性          | Astra                    | NexusQA                  |
| ------------- | ------------------------ | ------------------------ |
| 主色调        | 蓝色系 + 橙色CTA          | 黑色系 + 黄色强调         |
| 背景色        | 纯白 `#FFFFFF`           | 米白 `#F2F0E9`           |
| 圆角风格      | 标准圆角 8-12px          | 大圆角 16-32px           |
| 字体          | Inter                    | Plus Jakarta Sans        |
| 整体风格      | 专业企业风               | 现代 Bento 风格          |
| 阴影使用      | 轻阴影                   | 有色阴影                 |
| 徽章样式      | 方形圆角                 | 药丸形状                 |

---

## 十二、可借鉴元素

1. **进度面板设计**: 右侧固定的进度追踪面板，层级清晰
2. **分组列表**: 按状态分组的漏洞列表，带折叠功能
3. **统计卡片**: 带图标装饰的数字统计卡片
4. **CVSS评分展示**: 简洁的评分展示方式
5. **聊天支持组件**: 内置的客服沟通组件
6. **筛选器设计**: 多维度筛选器组合

---

## 更新日志

- **2025-11-26**: 从 Astra 平台截图提取设计规范
- **2025-11-26**: 补充遗漏内容
  - 顶部导航栏详细结构
  - 页面标题区域（状态徽章、编号、日期）
  - 进度面板详细样式（圆形进度环、子任务缩进）
  - 帮助卡片（Auditors + Need More Help）
  - 聊天消息卡片代码示例
  - 可折叠面板（Grades、Vulnerability Severity）
  - 列表行操作图标（验证、设置）
  - 工作区选择器（Workspace Selector）
  - 子导航项样式
