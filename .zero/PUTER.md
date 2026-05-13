# ZERO Agent + Puter.js (مجاني!)

## 🎉Model: MiniMax M2.7 - مجاني بدون API Key!

Puter.js يوفر نموذج **MiniMax M2.7** مجاناً بنظام **User-Pays** - أي المستخدم هو اللي يدفع، المطور لا يدفع شيء!

---

## 🚀 طريقة التشغيل

### 1️⃣ ثبت الحزمة:
```bash
npm install @heyputer/puter.js
```

### 2️⃣ الكود:
```javascript
import { puter } from '@heyputer/puter.js';

// ضع التوكن أو دع المستخدم يسجل عبر المتصفح
puter.setAuthToken('PUTER_AUTH_TOKEN');

const response = await puter.ai.chat('اكتب hello world', {
  model: 'minimax/minimax-m2.7',
  temperature: 0.7,
  max_tokens: 2000
});

console.log(response.message.content);
```

---

## 📋 الحصول على التوكن

### Option 1: User-Pays (مجاني للمطور!)
1. اذهب إلى https://puter.com
2. أنشئ حساب جديد
3. انسخ التوكن من Dashboard
4. المستخدم يدفع من رصيده الخاص

### Option 2: API مباشرة
1. https://platform.minimax.io
2. أنشئ مفتاح API
3. استخدم المفتاح مباشرة

---

## 💰الأسعار

| الطريقة | المطور يدفع؟ | المستخدم يدفع? |
|---------|--------------|---------------|
| Puter User-Pays | ❌ لا | ✅ نعم |
| MiniMax API | ❌ لا (trial) | - |

التكلفة للمستخدم:
- Input: $0.30/1M tokens
- Output: $1.20/1M tokens

---

## ⚙️ الإعدادات

```json
{
  "provider": "puter",
  "model": "minimax/minimax-m2.7",
  "contextWindow": 32000
}
```

---

## 🔗 الروابط

- الموقع: https://developer.puter.com
- التوكن: https://puter.com
- النموذج: https://platform.minimax.io

---

*ZERO Agent - نظام وكلاء متعدد مع Puter.js للتشغيل المجاني!* 🤖