/**
 * ZERO Agent Web Chat - Server
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

const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'together',
  model: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
  apiKey: process.env.AI_API_KEY || '',
  apiBase: process.env.AI_API_BASE || 'https://api.together.ai/v1'
};

const chatHistory = new Map();

async function callAI(message, context = []) {
  if (AI_CONFIG.apiKey) {
    try {
      const response = await fetch(`${AI_CONFIG.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            ...context.map(c => ({ role: c.role, content: c.content })),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  
  const responses = [
    `I'm ZERO Agent 🧠 - Your AI assistant powered by Qwen model. I can help you with coding, writing, and more!`,
    `Hello! I'm running on Qwen. What would you like me to help you with?`,
    `I've processed your request through the ZERO agent system. How can I assist you further?`,
    `Using Qwen model for AI capabilities. Tell me what you need!`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    if (!chatHistory.has(sessionId)) chatHistory.set(sessionId, []);
    const history = chatHistory.get(sessionId);
    
    const startTime = Date.now();
    const response = await callAI(message, history);
    const duration = Date.now() - startTime;
    
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history.splice(0, 10);
    
    res.json({
      success: true,
      message: response,
      metadata: { model: AI_CONFIG.model, provider: AI_CONFIG.provider, duration: `${duration}ms` }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  chatHistory.set(sessionId, []);
  res.json({ success: true });
});

app.get('/api/config', (req, res) => {
  res.json({ provider: AI_CONFIG.provider, model: AI_CONFIG.model, hasApiKey: !!AI_CONFIG.apiKey });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZERO Agent | الوكيل الذكي</title>
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
      --accent-hover: #06b6d4;
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
    .chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .message { max-width: 85%; padding: 14px 18px; border-radius: 18px; line-height: 1.6; }
    .message.user { align-self: flex-end; background: var(--accent); color: var(--bg-primary); border-bottom-left-radius: 4px; }
    .message.assistant { align-self: flex-start; background: var(--bg-card); border: 1px solid var(--border); border-bottom-right-radius: 4px; }
    .message.system { align-self: center; background: transparent; color: var(--text-muted); font-size: 0.875rem; text-align: center; }
    .message.typing { display: flex; gap: 4px; }
    .message.typing span { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; animation: typing 1.4s infinite; }
    .message.typing span:nth-child(2) { animation-delay: 0.2s; }
    .message.typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); }
    .quick-actions { display: flex; gap: 8px; padding: 0 20px 16px; flex-wrap: wrap; }
    .quick-btn { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; }
    .quick-btn:hover { background: var(--accent); color: var(--bg-primary); }
    .input-area { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 16px 20px; display: flex; gap: 12px; }
    .input-area input { flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; color: var(--text); font-size: 0.95rem; }
    .input-area input:focus { outline: none; border-color: var(--accent); }
    .input-area input::placeholder { color: var(--text-muted); }
    .input-area button { background: var(--accent); border: none; border-radius: 12px; padding: 14px 24px; color: var(--bg-primary); font-weight: 600; cursor: pointer; }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="app">
    <header class="header">
      <div class="logo">Z</div>
      <div class="header-text"><h1>ZERO Agent</h1><p>الوكيل الذكي المدعوم بالذكاء الاصطناعي</p></div>
      <span class="status-badge" id="status">● متصل</span>
    </header>
    <div class="chat" id="chat"><div class="message system">👋 مرحباً! أنا ZERO Agent 🧠<br>كيف يمكنني مساعدتك اليوم؟</div></div>
    <div class="quick-actions">
      <button class="quick-btn" onclick="sendQuick('اكتب كود hello world')">💻 كود</button>
      <button class="quick-btn" onclick="sendQuick('شرح ما هو الذكاء الاصطناعي')">📚 شرح</button>
      <button class="quick-btn" onclick="sendQuick('أنشئ قصة قصيرة')">📝 قصة</button>
      <button class="quick-btn" onclick="sendQuick('ترجم إلى الإنجليزية')">🌐 ترجمة</button>
      <button class="quick-btn" onclick="clearChat()">🗑️ مسح</button>
    </div>
    <div class="input-area">
      <input type="text" id="input" placeholder="اكتب رسالتك هنا..." onkeypress="handleKey(event)">
      <button id="sendBtn" onclick="sendMessage()">إرسال</button>
    </div>
  </div>
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    let isTyping = false;
    function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
    function showTyping() { const div = document.createElement('div'); div.className = 'message typing'; div.id = 'typing'; div.innerHTML = '<span></span><span></span><span></span>'; chat.appendChild(div); chat.scrollTop = chat.scrollHeight; isTyping = true; }
    function hideTyping() { const typing = document.getElementById('typing'); if (typing) typing.remove(); isTyping = false; }
    function addMessage(content, isUser = false) { const div = document.createElement('div'); div.className = 'message ' + (isUser ? 'user' : 'assistant'); div.textContent = content; chat.appendChild(div); chat.scrollTop = chat.scrollHeight; }
    async function sendMessage() { const message = input.value.trim(); if (!message || isTyping) return; input.value = ''; addMessage(message, true); showTyping(); sendBtn.disabled = true; try { const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) }); const data = await res.json(); hideTyping(); if (data.success) { addMessage(data.message); } else { addMessage('عذراً، حدث خطأ: ' + data.error); } } catch (e) { hideTyping(); addMessage('خطأ في الاتصال بالخادم'); } sendBtn.disabled = false; input.focus(); }
    function sendQuick(text) { input.value = text; sendMessage(); }
    async function clearChat() { await fetch('/api/clear', { method: 'POST' }); chat.innerHTML = '<div class="message system">👋 مرحباً! أنا ZERO Agent 🧠<br>كيف يمكنني مساعدتك اليوم؟</div>'; }
    input.focus();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n🚀 ZERO Agent Web Chat\n   http://localhost:${PORT}\n${AI_CONFIG.model ? 'Model: ' + AI_CONFIG.model : 'Demo mode (no API key)'}\n`);
});

export default app;