# 🎯 ZERO Tasks - Professional Task Manager

A modern, professional task management application built by **ZERO Agent**.

![ZERO Tasks](https://img.shields.io/badge/Built%20by-ZERO%20Agent-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)

## ✨ Features

### Frontend (Modern Kanban Board)
- 🎨 **Dark Mode UI** - Professional design with IBM Plex Sans font
- 📋 **Kanban Board** - Drag & drop tasks between columns
- 🏷️ **Tags & Priorities** - Organize with color-coded tags
- 👥 **Team Avatars** - Assign tasks to team members
- 📅 **Due Dates** - Track deadlines with overdue indicators
- ⌨️ **Keyboard Shortcuts** - Cmd+K for search, Cmd+N for new task
- 🔍 **Search** - Quick search across all tasks
- 📊 **Statistics** - Real-time task counts

### Backend (REST API)
- ⚡ **Fast API** - Express.js server
- 🔄 **Full CRUD** - Create, Read, Update, Delete tasks
- 📊 **Statistics** - Task counts by status
- 🔍 **Search** - Full-text search across tasks
- 👥 **Users** - Team management
- 📋 **Columns** - Configurable Kanban columns

## 🚀 Quick Start

### 1. Open the Frontend
Simply open `index.html` in your browser:
```bash
# Just open in browser
open index.html
# or use a local server
npx serve .
```

### 2. Run the Backend
```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3000
```

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:status` | Get tasks by status |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/move` | Move task to column |
| GET | `/api/columns` | Get all columns |
| GET | `/api/users` | Get team members |
| GET | `/api/stats` | Get statistics |
| GET | `/api/search?q=` | Search tasks |

## 🎨 Design

Built with:
- **Fonts**: IBM Plex Sans, JetBrains Mono
- **Colors**: Dark theme with neon green accents
- **Effects**: Smooth transitions, hover effects, glow

## 📁 Project Structure

```
zero-tasks/
├── index.html      # Frontend (Kanban Board)
├── server.js       # Backend API
├── package.json    # Dependencies
└── test-api.mjs   # API Tests
```

## 🤖 Built by ZERO Agent

This application was entirely built by ZERO Agent - an autonomous AI coding assistant with multi-agent system.

**ZERO Agent Capabilities:**
- 🧠 Orchestrator - Task coordination
- 💻 Code Agent - Writing code
- 🌐 Browser Agent - Web research
- ⚡ Execution Agent - Running tests
- 🔍 Code Review Agent - Quality checks
- 📁 File System Agent - File management

---

Made with ❤️ by **ZERO Agent** 🧠