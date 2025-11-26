# NexusQA 设计系统规范

> 基于项目代码提取的完整设计规范文档

---

## 一、色彩系统

### 1.1 核心品牌色

| 颜色名称 | HEX 值    | 用途                     |
| -------- | --------- | ------------------------ |
| 背景色   | `#F2F0E9` | 页面背景、主容器         |
| 表面色   | `#FFFFFF` | 卡片、面板、输入框背景   |
| 品牌黄   | `#FCD34D` | 强调色、进度条、活跃指示 |
| 深色     | `#18181B` | 文本、图标、深色按钮     |

### 1.2 中性色系（Zinc 调色板）

```
zinc-50:  #FAFAFA  - 悬停背景
zinc-100: #F4F4F5  - 分割线、禁用态
zinc-200: #E4E4E7  - 边框
zinc-300: #D4D4D8  - 次级边框
zinc-400: #A1A1AA  - 占位符文本
zinc-500: #71717A  - 次级文本
zinc-600: #52525B  - 正文文本
zinc-700: #3F3F46  - 强调文本
zinc-800: #27272A  - 主要文本
zinc-900: #18181B  - 标题、深色背景
```

### 1.3 状态色系

#### 测试状态

| 状态     | 背景色        | 文字色         | 边框色          |
| -------- | ------------- | -------------- | --------------- |
| DRAFT    | `bg-zinc-100` | `text-zinc-500`  | `border-zinc-200` |
| PASSED   | `bg-green-100`| `text-green-700` | `border-green-200`|
| FAILED   | `bg-red-100`  | `text-red-700`   | `border-red-200`  |
| BLOCKED  | `bg-orange-100`|`text-orange-700`| `border-orange-200`|
| SKIPPED  | `bg-gray-100` | `text-gray-500`  | `border-gray-200` |
| UNTESTED | `bg-gray-100` | `text-gray-600`  | `border-gray-200` |

#### 优先级色系

| 优先级   | 背景色         | 文字色           | 圆点色          |
| -------- | -------------- | ---------------- | --------------- |
| LOW      | `bg-zinc-100`  | `text-zinc-400`  | `bg-zinc-400`   |
| MEDIUM   | `bg-blue-50`   | `text-blue-600`  | `bg-blue-500`   |
| HIGH     | `bg-orange-50` | `text-orange-600`| `bg-orange-500` |
| CRITICAL | `bg-red-50`    | `text-red-600`   | `bg-red-500`    |

#### 审核状态

| 状态              | 背景色          | 文字色           |
| ----------------- | --------------- | ---------------- |
| PENDING           | `bg-yellow-100` | `text-yellow-700`|
| APPROVED          | `bg-blue-100`   | `text-blue-700`  |
| CHANGES_REQUESTED | `bg-red-100`    | `text-red-700`   |

---

## 二、字体排版系统

### 2.1 字体

```css
font-family: 'Plus Jakarta Sans', sans-serif;
```

### 2.2 字号层级

| 层级       | 字号      | 字重  | 用途       | Tailwind 类                        |
| ---------- | --------- | ----- | ---------- | ---------------------------------- |
| H1         | 32-48px   | 900   | 页面标题   | `text-3xl md:text-4xl font-black`  |
| H2         | 24px      | 900   | 版块标题   | `text-2xl font-black`              |
| H3         | 20px      | 900   | 子标题     | `text-xl font-black`               |
| H4         | 18px      | 700   | 卡片标题   | `text-lg font-bold`                |
| Body       | 14px      | 500   | 正文       | `text-sm font-medium`              |
| Small      | 12px      | 500   | 辅助文本   | `text-xs font-medium`              |
| XSmall     | 10px      | 700   | 标签、徽章 | `text-[10px] font-bold`            |

### 2.3 字间距（Letter Spacing）

```
tracking-tighter:  -0.03em  - 大标题
tracking-tight:    -0.015em - 标题
tracking-normal:   0        - 正文
tracking-wide:     0.025em  - 普通标签
tracking-[0.12em]: 0.12em   - 全大写标签（推荐）
tracking-widest:   0.1em    - 大写标签
```

---

## 三、间距系统

### 3.1 内边距（Padding）

```
p-1:  4px   - 极小
p-2:  8px   - 小
p-3:  12px  - 小中
p-4:  16px  - 中
p-5:  20px  - 中大
p-6:  24px  - 大
p-8:  32px  - 更大
```

### 3.2 元素间距（Gap）

```
gap-1:  4px   - 图标间距
gap-2:  8px   - 徽章内部
gap-3:  12px  - 表单字段
gap-4:  16px  - 卡片内容
gap-6:  24px  - 版块间距
```

### 3.3 应用参考

| 组件       | Padding            |
| ---------- | ------------------ |
| 按钮       | `px-4 py-2.5` 或 `px-5 py-2.5` |
| 卡片       | `p-6`              |
| 表格单元格 | `px-6 py-5`        |
| 模态框     | `px-6 py-5` 或 `p-6` |
| 徽章       | `px-2 py-1` 或 `px-3 py-1` |
| Banner     | `px-6 py-5`        |

---

## 四、圆角规范

| 名称   | 半径  | Tailwind 类      | 用途                 |
| ------ | ----- | ---------------- | -------------------- |
| 小     | 6px   | `rounded-md`     | 小按钮               |
| 中     | 8px   | `rounded-lg`     | 标准按钮、输入框     |
| 大     | 12px  | `rounded-xl`     | 主要按钮、面板       |
| 更大   | 16px  | `rounded-2xl`    | 大型卡片、Banner     |
| 最大   | 32px  | `rounded-[2rem]` | Bento 卡片、模态框   |
| 圆形   | 50%   | `rounded-full`   | 头像、徽章、圆点     |

---

## 五、阴影系统

### 5.1 标准阴影

| 等级      | Tailwind 类  | 用途             |
| --------- | ------------ | ---------------- |
| 微弱      | `shadow-sm`  | 边框替代、细微提升 |
| 标准      | `shadow`     | 卡片             |
| 中等      | `shadow-md`  | 悬停状态         |
| 大        | `shadow-lg`  | 按钮悬停         |
| 更大      | `shadow-xl`  | 下拉菜单         |
| 最大      | `shadow-2xl` | 模态框           |

### 5.2 自定义有色阴影

```css
/* 深色按钮 - 带 zinc 色调 */
shadow-[0_4px_14px_-3px_rgba(39,39,42,0.4)]

/* 悬停增强 */
shadow-[0_6px_20px_-3px_rgba(39,39,42,0.5)]

/* 表格卡片 */
shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]
```

---

## 六、组件样式

### 6.1 按钮

#### 主要按钮（深色）

```jsx
<button className="
  bg-zinc-900 text-white
  px-5 py-2.5 rounded-xl
  text-sm font-bold
  shadow-[0_4px_14px_-3px_rgba(39,39,42,0.4)]
  hover:bg-zinc-800
  hover:shadow-[0_6px_20px_-3px_rgba(39,39,42,0.5)]
  hover:-translate-y-0.5
  transition-all
">
  Create Case
</button>
```

#### 次级按钮（白色）

```jsx
<button className="
  bg-white text-zinc-600
  border border-zinc-200
  px-4 py-2.5 rounded-xl
  text-sm font-bold
  shadow-sm
  hover:bg-zinc-50
  hover:text-zinc-900
  hover:border-zinc-300
  transition-all
">
  Export
</button>
```

#### 图标按钮

```jsx
<button className="
  p-2.5 rounded-xl
  text-zinc-500
  hover:text-zinc-900
  hover:bg-zinc-100
  border border-zinc-200
  bg-white shadow-sm
  transition-colors
">
  <Icon className="w-4 h-4" />
</button>
```

### 6.2 徽章

#### 状态徽章

```jsx
<span className="
  inline-flex items-center
  rounded-full px-3 py-1
  text-[10px] font-bold uppercase
  tracking-wider border
  bg-green-100 text-green-700 border-green-200
">
  PASSED
</span>
```

#### 优先级徽章

```jsx
<span className="
  inline-flex items-center gap-1.5
  text-[10px] uppercase tracking-wider font-bold
  bg-orange-50 text-orange-600
  px-2 py-1 rounded-full
">
  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
  HIGH
</span>
```

### 6.3 卡片

#### Bento 卡片

```jsx
<div className="
  bg-white border border-zinc-100
  rounded-[2rem]
  shadow-sm
  p-6
  transition-all duration-500
  hover:-translate-y-1
  hover:shadow-2xl
">
  {/* 内容 */}
</div>
```

#### 表格容器

```jsx
<div className="
  rounded-[1.5rem]
  bg-white border border-zinc-200
  shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]
  overflow-hidden
">
  <table>...</table>
</div>
```

### 6.4 输入框

```jsx
<input className="
  w-full
  bg-zinc-100/50 border border-zinc-200
  rounded-xl
  px-4 py-2
  text-sm
  focus:bg-white
  focus:ring-2 focus:ring-zinc-900/5
  focus:border-zinc-300
  outline-none
  transition-all
" />
```

### 6.5 侧边栏导航项

```jsx
<button className={`
  w-full flex items-center
  px-3 py-3 rounded-xl
  transition-all duration-200 mb-1
  group relative
  ${active
    ? "bg-zinc-100/80 text-zinc-900"
    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
  }
`}>
  {/* 活跃指示条 */}
  {active && (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-yellow-400 rounded-r-full" />
  )}
  <Icon className={active ? "text-zinc-900" : "text-zinc-500"} />
  <span className={active ? "font-bold" : "font-medium"}>{label}</span>
</button>
```

### 6.6 Tab 导航

```jsx
<div className="flex bg-white rounded-xl p-1.5 border border-zinc-200 shadow-sm gap-1">
  <button className={`
    px-4 py-2 rounded-lg
    text-xs font-bold
    flex items-center
    transition-all
    ${active
      ? 'bg-zinc-100 text-zinc-900'
      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
    }
  `}>
    <Icon className={active ? 'text-yellow-500' : ''} />
    Label
  </button>
</div>
```

### 6.7 通知 Banner

```jsx
<div className="
  bg-amber-50 border border-amber-200
  rounded-2xl px-6 py-5
  flex items-center justify-between
  shadow-sm
  animate-in slide-in-from-top-4 fade-in duration-500
">
  <div className="flex items-center gap-4">
    <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
      <Icon />
    </div>
    <div>
      <h4 className="text-sm font-bold text-zinc-900 mb-0.5">Title</h4>
      <p className="text-xs text-zinc-500 font-medium">Description</p>
    </div>
  </div>
  <button className="
    px-5 py-2.5
    bg-amber-500 border border-amber-600
    text-white text-xs font-bold
    rounded-lg
    shadow-md
    hover:bg-amber-600
    hover:shadow-lg hover:-translate-y-0.5
    transition-all
  ">
    Action
  </button>
</div>
```

### 6.8 模态框

```jsx
<div className="
  fixed inset-0
  flex items-center justify-center
  z-50 p-4
  animate-in fade-in duration-300
" style={{ background: 'rgba(0,0,0,0.5)' }}>
  <div className="
    bg-white border border-zinc-200
    rounded-[2rem]
    w-full max-w-md
    shadow-2xl
    animate-in zoom-in-95 slide-in-from-bottom-8 duration-400
  ">
    {/* 内容 */}
  </div>
</div>
```

---

## 七、动画与过渡

### 7.1 过渡时间

| 时间    | 用途           | Tailwind 类    |
| ------- | -------------- | -------------- |
| 200ms   | 快速交互       | `duration-200` |
| 300ms   | 标准过渡       | `duration-300` |
| 500ms   | 重要动画       | `duration-500` |
| 1000ms  | 进度条动画     | `duration-1000`|

### 7.2 入场动画

```
animate-in fade-in                    - 淡入
animate-in zoom-in-95                 - 缩放淡入
animate-in slide-in-from-bottom-8     - 从底部滑入
animate-in slide-in-from-top-4        - 从顶部滑入
```

### 7.3 悬停效果

```jsx
// 卡片悬停
className="transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"

// 按钮悬停
className="transition-all hover:-translate-y-0.5 hover:shadow-lg"

// 图标悬停
className="transition-colors duration-200 hover:text-zinc-900"
```

---

## 八、全大写文本规范

全大写标签（如 TEST SUITES、RECENT）需要：

```jsx
<span className="
  text-[10px]
  font-bold
  text-zinc-500
  uppercase
  tracking-[0.12em]
">
  TEST SUITES
</span>
```

---

## 九、响应式设计

```
sm:  640px   - 平板竖屏
md:  768px   - 平板横屏/小桌面
lg:  1024px  - 桌面
xl:  1280px  - 大桌面
```

常用模式：

```jsx
// 响应式布局
className="flex flex-col md:flex-row"

// 响应式显示/隐藏
className="hidden md:block"
className="md:hidden"

// 响应式间距
className="px-4 md:px-8"

// 响应式字号
className="text-2xl md:text-3xl"
```

---

## 十、快速参考

### 常用组合

```
卡片:       rounded-[2rem] bg-white border border-zinc-100 p-6 shadow-sm
深色按钮:   bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold
浅色按钮:   bg-white text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-xl
图标按钮:   p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50
徽章:       inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase
输入框:     bg-zinc-100/50 border border-zinc-200 rounded-xl px-4 py-2
表格行:     px-6 py-5 hover:bg-zinc-50/80 transition-all
```

### 颜色快速参考

```
背景:       bg-[#F2F0E9]
卡片:       bg-white
主文字:     text-zinc-900
次文字:     text-zinc-600
弱文字:     text-zinc-400
边框:       border-zinc-200
品牌色:     bg-yellow-400 / text-yellow-500
```

---

## 更新日志

- **2025-11-25**: 初始版本，从项目代码提取
