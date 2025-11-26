# Project Context: Internal Tool Portal (DevPortal)

## Workflow Rules (CRITICAL)
This project enforces strict workflow execution rules.
!{cat .agent/references/workflow-rules.md}

## Overview
This project is a **React-based dashboard** designed to serve as a central hub for internal engineering tools. It allows users to:
- View a catalog of internal services (CI/CD, Databases, Monitoring, etc.).
- Filter tools by category or search by name/description.
- Access direct links to tool interfaces, logs, admin panels, and repositories.
- Simulate adding new tools (currently client-side only).

**Project Name:** `radiant-nova` (Package Name) / "内部工具门户" (Directory Name)

## Architecture & Technologies

### Core Stack
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Language:** JavaScript (ESModules)

### Project Structure
- **`src/App.jsx`**: Main entry point containing the layout (Sidebar + Main Content), state management (tools list, search, filter), and routing logic (simulated via categories).
- **`src/data/mockData.js`**: Contains the `tools` array, which acts as the mock database for the application.
- **`src/components/`**:
    - `ToolCard.jsx`: Displays individual tool details (status, version, links).
    - `AddToolModal.jsx`: Form to add a new tool.
    - `StatusBadge.jsx`: Visual indicator for tool status (online, offline, maintenance).
- **`public/`**: Static assets.

### Styling
- **Approach:** A mix of global CSS classes (likely in `index.css`) and inline React styles for dynamic values (e.g., mouse tracking effects).
- **Theme:** Dark mode aesthetic with glassmorphism effects (`backdrop-filter`), utilizing CSS variables for colors (e.g., `--accent-primary`, `--bg-mesh`).

## Development Workflow

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Key Commands
| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the development server (typically at `http://localhost:5173`). |
| `npm run build` | Build the application for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint to check for code quality issues. |

## Conventions

*   **Components:** Functional components with hooks (`useState`, `useMemo`).
*   **State Management:** Local component state (`useState`) in `App.jsx` passed down via props. No global state manager (Redux/Context) is currently in use.
*   **Data Flow:** Unidirectional. Data originates in `App.jsx` (initialized from `mockData.js`) and flows down to `ToolCard`.
*   **Styling:** Use CSS variables for theming. Maintain the dark/glassmorphic visual style.
