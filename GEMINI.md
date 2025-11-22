# 项目概览

这是一个基于 **React 的软件开发测试框架**应用程序，旨在管理测试用例、项目和执行。它利用 **Google 的 Gemini AI** 自动生成测试步骤、UI 模型和用户头像。

## 主要功能

*   **项目管理：** 创建和查看带有 AI 生成封面图像的项目。
*   **测试用例管理：**
    *   创建包含详细描述、前置条件和优先级的测试用例。
    *   **AI 驱动的步骤生成：** 使用 `gemini-2.5-flash` 根据测试用例标题和描述自动生成逻辑测试步骤（动作/预期结果）。
    *   **视觉参考：** 使用 `gemini-2.5-flash-image` 生成 UI 模型图像或图标。
*   **执行历史：** 跟踪测试执行状态（通过、失败、阻塞）、负责人和历史记录。
*   **用户管理：** 用户角色（管理员、QA 负责人、测试人员）和 AI 生成的头像。

# 技术架构

## 核心技术栈

*   **前端框架：** React 19
*   **构建工具：** Vite（服务器端口：3000）
*   **语言：** TypeScript
*   **样式：** Tailwind CSS（根据使用模式推断，尽管未明确读取配置，但此技术栈的标准配置）/标准 CSS
*   **图标：** Lucide React

## AI 集成 (`api.ts`)

应用程序使用 `@google/genai` SDK 与 Gemini 模型进行交互。

*   **文本生成 (`gemini-2.5-flash`)：** 用于生成结构化的 JSON 测试步骤。
*   **图像生成 (`gemini-2.5-flash-image`)：** 用于生成：
    *   项目封面图像（抽象科技图标）。
    *   测试用例视觉参考（UI 模型）。
    *   用户头像（写实人像）。

## 数据模型 (`types.ts`)

*   **Project：** `id`, `name`, `description`, `coverImage`, `repositoryUrl`。
*   **TestCase：** `id`, `steps`（动作/预期）、`status`、`priority`、`visualReference`、`history`。
*   **User：** `id`, `name`, `role`, `avatar`。
*   **ExecutionRecord：** 跟踪带有状态、环境和备注的单独测试运行。

# 开发

## 前提条件

*   Node.js（推荐 v18+）
*   Google Gemini API 密钥

## 设置

1.  **安装依赖项：**
    ```bash
    npm install
    ```

2.  **配置环境变量：**
    在根目录创建 `.env.local` 文件：
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

## 脚本

| 命令 | 描述 |
| :--- | :--- |
| `npm run dev` | 在 `http://0.0.0.0:3000` 启动本地开发服务器。 |
| `npm run build` | 构建生产就绪应用程序。 |
| `npm run preview` | 在本地预览构建的应用程序。 |
| `./start_debug.sh` | **推荐的开发启动脚本。** 启动 Vite 开发服务器并在可见的 Chrome 浏览器中打开应用。同时，它会将服务器日志重定向到 `server.log`，并将浏览器控制台日志（包括错误和网络请求失败）实时写入 `browser.log`。此脚本还配置了 `Ctrl+C` 信号处理，以确保在退出时正确关闭所有后台进程。 |

## 工作流强制要求

为确保代码变更不会引入新的错误，**在完成一轮对话或一系列相关修改后，必须执行以下命令进行验证：**

```bash
node check_logs.js
```
(或者使用简化命令 `/check` 如果在 CLI 环境中)

如果命令输出显示错误，必须在提交或继续开发前修复这些问题。

### 日志系统

为了便于调试，应用程序已集成一个日志系统，它将关键运行时信息持久化到文件中：
*   **`server.log`**: 包含 `npm run dev` (Vite) 的所有输出，例如构建信息、Vite 服务器启动消息以及任何后端代理日志。
*   **`browser.log`**: 通过 `console_watcher.js` 捕获的浏览器控制台日志。这包括应用内部的 `console.log`、JavaScript 运行时错误、未捕获的异常以及失败的网络请求。此文件由非无头模式的 `puppeteer` 驱动，允许用户在浏览器中交互时收集日志。

当您需要排查问题时，可以通过检查这两个文件来获取完整的上下文。

## 目录结构

*   `src/api.ts`：所有 Gemini API 调用的集中逻辑。
*   `src/types.ts`：所有领域实体的 TypeScript 接口。
*   `src/components/`：可重用的 UI 组件（模态框、列表）。
*   `src/views/`：页面级组件（仪表板、登录、项目详细信息）。
*   `src/vite.config.ts`：Vite 配置，包括环境变量处理。

# 约定

*   **路径别名：** `@` 符号配置为解析到项目根目录 (`.`)。
*   **环境变量：** 通过 `process.env.GEMINI_API_KEY` 访问（在 `vite.config.ts` 中填充）。
*   **状态管理：** 可能使用本地 React 状态 (`useState`、`useEffect`) 或 Context，考虑到 `package.json` 中没有 Redux/Zustand（通过缺少依赖项验证），这表明其简单性。