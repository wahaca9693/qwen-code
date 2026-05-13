# ZERO Agent - بدائل مجانية حقيقية

## ⚠️澄清
Puter.js يحتاج حساب Puter ودفع المستخدم. هذي الحلول الحقيقية المجانية:

---

## 🏆 الخيارات المجانية الحقيقية

### 1️⃣ Groq - مجاني (الأسرع!)
```bash
npm install groq
```

```javascript
import Groq from 'groq';

const client = new Groq({ apiKey: 'grq_ مجاني_توكن' });

// أو استخدم OpenAI compatible:
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer مجاني_توكن',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: 'مرحبا' }]
  })
});
```

**الموقع:** https://console.groq.com
- **مجاناً:** نعم، بدون بطاقة ائتمان
- **الحد:** 6,000 tokens/minute
- **الميزة:** الأسرع في العالم (LPU hardware)

---

### 2️⃣ Hugging Face - Serverless Inference (مجاناً)

```javascript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference('hf_ مجاني_توكن');

const result = await hf.chatCompletion({
  model: 'microsoft/Phi-3-mini-128k-instruct',
  messages: [{ role: 'user', content: 'مرحبا' }],
  max_tokens: 500
});
```

**الموقع:** https://huggingface.co
- **مجاناً:** نعم، Hub مجاني
- **النماذج:** thousands freely available

---

### 3️⃣ Ollama (محلياً - 100% مجاني!)

```bash
# ثبت Ollama
curl -fsSL https://ollama.com/install | sh

# شغل نماذج مجانية
ollama run qwen2.5     # من Alibaba
ollama run llama3     # من Meta
ollama run mistral    # من Mistral
ollama run phi        # من Microsoft
```

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'anything'
});
```

**الموقع:** https://ollama.com
- **مجاناً:** 100% مجاني (على جهازك)
- **لا حد!** -无限 usage

---

### 4️⃣ Google AI Studio (مجاناً)

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('مجاناً_توكن');
const model = genAI.getModel('gemini-2.0-flash');

const result = await model.generateContent('مرحبا');
```

**الموقع:** https://aistudio.google.com
- **مجاناً:** نعم، بدون بطاقة
- **الحد:** حسب الاستخدام

---

### 5️⃣ OpenRouter (Free Tier)

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: 'مجاناً_توكن_من_openrouter'
});

const response = await client.chat.completions.create({
  model: 'meta-llama/llama-3.3-70b-instruct',
  messages: [{ role: 'user', content: 'مرحبا' }]
});
```

**الموقع:** https://openrouter.ai
- **مجاني لحد:** models مجانية + starter credits
- **بدون بطاقة:** نعم

---

## 📊 مقارنة

| المزود | مجاني? | بطاقة? | الحد |
|-------|--------|--------|------|
| Groq | ✅ | ❌ | 6K tokens/min |
| Hugging Face | ✅ | ❌ | محدود |
| Ollama (محلي) | ✅ | ✅ | لا يوجد! |
| Google AI | ✅ | ❌ | يومي |
| OpenRouter | ✅ | ❌ | محدود |
| Puter.js | ❌ | ❌ يدفع المستخدم | - |

---

## 🎯 التوصية

**للاستخدام المحلي (100% مجاني):**
```bash
ollama serve
zero --model ollama:qwen2.5
```

**للاستخدام السحابي (Groq - الأسرع):**
```bash
# احصل على مفتاح من https://console.groq.com
zero --provider groq --api-key مجاني_توكن
```

---

*ZERO Agent - الآن مع دعم Ollama و Groq و Hugging Face!* 🤖