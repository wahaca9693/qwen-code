/**
 * ZERO Agent Web Chat - Server with FREE AI Providers
 * No API key needed when using Ollama or other free providers!
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// FREE AI Providers - NO API KEY REQUIRED!
const FREE_PROVIDERS = {
  // 1. Ollama (local - 100% free!)
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'qwen2.5',
    enabled: true
  }
};

const chatHistory = new Map();

// Try FREE AI first, then fallback to demo
async function callAI(message, context = []) {
  // 1. Try Ollama (local free AI)
  try {
    const response = await fetch(`${FREE_PROVIDERS.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5',
        messages: [
          ...context.map(c => ({ role: c.role, content: c.content })),
          { role: 'user', content: message }
        ],
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.message?.content) {
        return {
          response: data.message.content,
          provider: 'ollama',
          model: 'qwen2.5'
        };
      }
    }
  } catch (e) {
    console.log('Ollama not available - using demo mode');
  }
  
  // 2. Demo mode (fallback)
  return demoResponse(message);
}

function demoResponse(msg) {
  const responses = [
    'مرحباً! ZERO Agent جاهز 🧠',
    'أهلاً! How can I help?',
    '🧠 Ready!',
    `🧠 **ZERO Agent** - الذكاء الاصطناعي!\n\nمرحباً! أنا جاهز للخدمة.\n\nللاستفادة من الذكاء الاصطناعي المجاني:\n• ثبت Ollama محلياً\n• أو استخدم Cloudflare\n\nما الذي تريده؟`,
    `👋 أهلاً!\n\nأنا **ZERO Agent** - وكلك الذكي.\n\n⚡我可以:\n- 💻 كتابة كود\n- 📝 كتابة نصوص\n- 🌐 ترجمة\n- 📚 شرح\n\nكيف أساعدك؟`,
    `مرحباً! 🧠\n\nجاهز للمساعدة!`,
    `🧠 ZERO Agent يتكلم بالعربية!\n\n Saya bisa membantu Anda!`,
    `أهلاً! Say hello in any language and I'll respond! 🌏`
  ];
  
  return {
    response: responses[Math.floor(Math.random() * responses.length)],
    provider: 'demo',
    model: 'demo-mode'
  };
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    if (!chatHistory.has(sessionId)) chatHistory.set(sessionId, []);
    const history = chatHistory.get(sessionId);
    
    const startTime = Date.now();
    const result = await callAI(message, history);
    const duration = Date.now() - startTime;
    
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result.response });
    if (history.length > 20) history.splice(0, 10);
    
    res.json({
      success: true,
      message: result.response,
      metadata: {
        model: result.model,
        provider: result.provider,
        duration: `${duration}ms`,
        free: result.provider !== 'demo'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clear', (req, res) => {
  chatHistory.set(req.body.sessionId || 'default', []);
  res.json({ success: true });
});

app.get('/api/providers', (req, res) => {
  res.json({
    free: ['ollama', 'cloudflare', 'huggingface'],
    current: 'ollama or demo'
  });
});

// Main HTML Page
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZERO Agent | الوكيل الذكي المجاني</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-primary: #09090b;
      --bg-secondary: #18181b;
      --bg-tertiary: #27272a;
      --bg-card: #1c1c21;
      --accent: #22d3ee;
      --text: #fafafa;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --border: #3f3f46;
      --success: #10b981;
    }
    html, body { height: 100%; font-family: 'IBM Plex Sans', sans-serif; background: var(--bg-primary); color: var(--text); }
    .app { display: flex; flex-direction: column; height: 100vh; max-width: 800px; margin: 0 auto; }
    .header { background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    .logo { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent), #06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: var(--bg-primary); }
    .header-text h1 { font-size: 1.125rem; font-weight: 600; }
    .header-text p { font-size: 0.75rem; color: var(--text-muted); }
    .status-badge { margin-right: auto; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .badge-demo { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .message { max-width: 85%; padding: 14px 18px; border-radius: 18px; line-height: 1.6; white-space: pre-wrap; }
    .message.user { align-self: flex-end; background: var(--accent); color: var(--bg-primary); border-bottom-left-radius: 4px; }
    .message.assistant { align-self: flex-start; background: var(--bg-card); border: 1px solid var(--border); border-bottom-right-radius: 4px; }
    .message.system { align-self: center; background: transparent; color: var(--text-muted); font-size: 0.875rem; text-align: center; }
    .quick-actions { display: flex; gap: 8px; padding: 0 20px 16px; flex-wrap: wrap; }
    .quick-btn { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; }
    .quick-btn:hover { background: var(--accent); color: var(--bg-primary); }
    .input-area { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 16px 20px; display: flex; gap: 12px; }
    .input-area input { flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; color: var(--text); font-size: 0.95rem; }
    .input-area input:focus { outline: none; border-color: var(--accent); }
    .input-area input::placeholder { color: var(--text-muted); }
    .input-area button { background: var(--accent); border: none; border-radius: 12px; padding: 14px 24px; color: var(--bg-primary); font-weight: 600; cursor: pointer; }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
    .info-bar { text-align: center; padding: 8px; font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .info-bar a { color: var(--accent); }
  </style>
</head>
<body>
  <div class="app">
    <div class="info-bar">⚡ ZERO Agent - <a href="https://github.com/wahaca9693/qwen-code">مصدر مفتوح</a> | FREE AI Demo</div>
    <header class="header">
      <div class="logo">Z</div>
      <div class="header-text"><h1>ZERO Agent</h1><p>الوكيل الذكي 🧠 مجاني</p></div>
      <span class="status-badge badge-demo" id="status">● تجريبي</span>
    </header>
    <div class="chat" id="chat"><div class="message system">🧠 مرحباً! ZERO Agent\n\n💡 للتحديث: ثبت Ollama مجاني!</div></div>
    <div class="quick-actions">
      <button class="quick-btn" onclick="sendQuick('hi')">👋 Hello</button>
      <button class="quick-btn" onclick="sendQuick('مرحبا')">Arabic</button>
      <button class="quick-btn" onclick="sendQuick('كود hello')">💻 Code</button>
      <button class="quick-btn" onclick="clearChat()">🗑️ Clear</button>
    </div>
    <div class="input-area">
      <input type="text" id="input" placeholder="Type your message..." onkeypress="handleKey(event)">
      <button id="sendBtn" onclick="sendMessage()">Send</button>
    </div>
  </div>
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    let isTyping = false;
    function handleKey(e) { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }
    function showTyping() { const div = document.createElement('div'); div.className = 'message typing'; div.style.cssText = 'display:flex;gap:4px;align-self:center;padding:12px;'; for(let i=0;i<3;i++){let s=document.createElement('span');s.style.cssText='width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite;animation-delay:'+(i*0.2)+'s';div.appendChild(s);} chat.appendChild(div); chat.scrollTop = chat.scrollHeight; }
    function hideTyping() { document.querySelectorAll('.typing').forEach(e=>e.remove()); }
    function addMessage(content, isUser = false) { const div = document.createElement('div'); div.className = 'message ' + (isUser ? 'user' : 'assistant'); div.textContent = content; chat.appendChild(div); chat.scrollTop = chat.scrollHeight; }
    async function sendMessage() { const message = input.value.trim(); if (!message || isTyping) return; input.value = ''; addMessage(message, true); showTyping(); sendBtn.disabled = true; try { const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) }); const data = await res.json(); hideTyping(); if (data.success) { addMessage(data.message); if(data.metadata?.provider) document.getElementById('status').textContent = '● ' + data.metadata.provider; } else { addMessage('Error: ' + data.error); } } catch (e) { hideTyping(); addMessage('Connection error'); } sendBtn.disabled = false; input.focus(); }
    function sendQuick(text) { input.value = text; sendMessage(); }
    async function clearChat() { await fetch('/api/clear', { method: 'POST' }); chat.innerHTML = '<div class="message system">🧠 ZERO Agent Ready</div>'; }
    input.focus();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`
🚀 ZERO Agent Web - FREE AI Demo
   http://localhost:${PORT}

📖 Install FREE AI: https://ollama.com
  `);
});

export default app;
