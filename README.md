# NexusQA

**NexusQA** is a modern, AI-powered software development test framework designed to streamline the Quality Assurance process. Built with **React 19** and **TypeScript**, it integrates **Google's Gemini AI** to automate test case generation, create visual UI mockups, and manage test executions intelligently.

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-Fast-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5-orange?logo=google" alt="Gemini AI" />
</div>

## 🚀 Key Features

- **🤖 AI-Driven Test Generation**: Automatically generates detailed test steps (actions and expected results) from simple descriptions using `gemini-2.5-flash`.
- **🎨 Visual UI Mockups**: Instantly generates visual references and UI mockups for test cases using `gemini-2.5-flash-image`.
- **📂 Smart Project Management**: Organize projects with AI-generated cover art and comprehensive metadata.
- **📊 Execution Tracking**: Track test runs, status (Pass/Fail/Block), and history with a clean, intuitive dashboard.
- **👥 User Management**: Role-based access (Admin, QA Lead, Tester) with AI-generated user avatars.
- **🌍 Internationalization**: Built-in support for English and Chinese (简体中文).

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (inferred)
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Browser Automation**: Puppeteer (for logs/debugging)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:AllenHyang/NexusQA.git
   cd NexusQA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server using Vite. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |
| `./start_debug.sh` | **Recommended for Dev:** Starts the server and a visible Chrome instance for detailed logging (`server.log` & `browser.log`). |

## 📂 Project Structure

```
/
├── src/
│   ├── api.ts              # Gemini API integration logic
│   ├── components/         # Reusable UI components (Modals, History, etc.)
│   ├── contexts/           # React Contexts (e.g., LanguageContext)
│   ├── views/              # Page views (Dashboard, Login, ProjectDetail, etc.)
│   ├── types.ts            # TypeScript interfaces
│   ├── translations.ts     # i18n resources
│   └── ...
├── check_logs.js           # Log monitoring utility
├── console_watcher.js      # Browser console log capturer
└── vite.config.ts          # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.