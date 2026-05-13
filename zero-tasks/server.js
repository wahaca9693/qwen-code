/**
 * ZERO Tasks - Backend API Server
 * Built by ZERO Agent
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
let tasks = [
  {
    id: '1',
    title: 'Design system architecture for the new dashboard',
    description: 'Create a comprehensive design system with components, tokens, and documentation',
    status: 'todo',
    priority: 'high',
    tags: ['Frontend', 'Design'],
    assignee: 'AH',
    dueDate: '2024-12-10',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Integrate Stripe payment gateway for Pro plans',
    description: 'Implement subscription payments with Stripe',
    status: 'todo',
    priority: 'medium',
    tags: ['Backend'],
    assignee: 'MK',
    dueDate: '2024-12-15',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Update documentation with new API endpoints',
    description: 'Add documentation for all new API endpoints',
    status: 'todo',
    priority: 'low',
    tags: ['Docs'],
    assignee: 'LO',
    dueDate: '2024-12-20',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Build authentication system with OAuth2',
    description: 'Implement OAuth2 with Google and GitHub providers',
    status: 'in-progress',
    priority: 'high',
    tags: ['Backend', 'Security'],
    assignee: 'AH',
    dueDate: '2024-12-08',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Create animated onboarding flow for new users',
    description: 'Design and implement onboarding animations',
    status: 'in-progress',
    priority: 'medium',
    tags: ['Frontend'],
    assignee: 'SA',
    dueDate: '2024-12-12',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Implement real-time notifications with WebSocket',
    description: 'Add WebSocket support for live notifications',
    status: 'in-progress',
    priority: 'medium',
    tags: ['Backend', 'Frontend'],
    assignee: 'MK',
    dueDate: '2024-12-14',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    title: 'Fix dark mode contrast issues on mobile devices',
    description: 'Fix accessibility issues in dark mode',
    status: 'review',
    priority: 'high',
    tags: ['Frontend', 'Bug'],
    assignee: 'SA',
    dueDate: '2024-12-05',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    title: 'Add keyboard shortcuts documentation',
    description: 'Document all available keyboard shortcuts',
    status: 'review',
    priority: 'medium',
    tags: ['Docs'],
    assignee: 'LO',
    dueDate: '2024-12-06',
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    title: 'Setup project repository and CI/CD pipeline',
    description: 'Initialize Git repo and GitHub Actions',
    status: 'done',
    priority: 'high',
    tags: ['DevOps'],
    assignee: 'AH',
    dueDate: '2024-12-01',
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    title: 'Create brand identity and design tokens',
    description: 'Design logos, colors, and typography',
    status: 'done',
    priority: 'medium',
    tags: ['Design'],
    assignee: 'SA',
    dueDate: '2024-12-02',
    createdAt: new Date().toISOString()
  }
];

let columns = [
  { id: 'todo', title: 'To Do', color: '#3b82f6', wip: null },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', wip: 5 },
  { id: 'review', title: 'In Review', color: '#a855f7', wip: null },
  { id: 'done', title: 'Done', color: '#22c55e', wip: null }
];

let users = [
  { id: 'AH', name: 'Ahmed Hassan', avatar: '#00ff9d' },
  { id: 'MK', name: 'Mohammed Khalid', avatar: '#a855f7' },
  { id: 'SA', name: 'Sara Ahmed', avatar: '#ec4899' },
  { id: 'LO', name: 'Lina Omar', avatar: '#3b82f6' }
];

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get tasks by status
app.get('/api/tasks/:status', (req, res) => {
  const { status } = req.params;
  const filtered = tasks.filter(t => t.status === status);
  res.json(filtered);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, tags, assignee, dueDate } = req.body;
  
  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    status: 'todo',
    priority: priority || 'medium',
    tags: tags || [],
    assignee: assignee || null,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[index] = { ...tasks[index], ...req.body };
  res.json(tasks[index]);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

// Move task to different column
app.patch('/api/tasks/:id/move', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  task.status = status;
  res.json(task);
});

// Get columns
app.get('/api/columns', (req, res) => {
  res.json(columns);
});

// Get users/team members
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return new Date(t.dueDate) < new Date();
    }).length
  };
  
  res.json(stats);
});

// Search tasks
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json(tasks);
  }
  
  const query = q.toLowerCase();
  const results = tasks.filter(t => 
    t.title.toLowerCase().includes(query) ||
    t.description?.toLowerCase().includes(query) ||
    t.tags.some(tag => tag.toLowerCase().includes(query))
  );
  
  res.json(results);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎯 ZERO Tasks API Server                               ║
║   Built by ZERO Agent 🧠                                 ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║                                                           ║
║   Endpoints:                                             ║
║   - GET    /api/tasks         → All tasks                ║
║   - GET    /api/tasks/:status → Tasks by status         ║
║   - POST   /api/tasks         → Create task             ║
║   - PUT    /api/tasks/:id     → Update task             ║
║   - DELETE /api/tasks/:id     → Delete task             ║
║   - PATCH  /api/tasks/:id/move → Move task             ║
║   - GET    /api/columns      → Get columns             ║
║   - GET    /api/users        → Team members            ║
║   - GET    /api/stats       → Statistics               ║
║   - GET    /api/search?q=   → Search tasks            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;