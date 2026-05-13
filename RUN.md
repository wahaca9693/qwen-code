# ZERO Agent - التشغيل والشرح

## 🚀 التشغيل السريع

### الطريقة الأولى: تشغيل مباشر
```bash
zero
```

### الطريقة الثانية: من المجلد المحلي
```bash
# Clone المشروع
git clone https://github.com/wahaca9693/qwen-code.git
cd qwen-code

# تثبيت المتطلبات
npm install

# بناء المشروع
npm run build

# تشغيل
node dist/cli.js
```

---

## ⚙️ الإعداد

### إنشاء ملف الإعدادات
```bash
nano ~/.zero/settings.json
```

### محتوى الإعدادات:
```json
{
  "modelProviders": [
    {
      "id": "google",
      "name": "Google Gemini",
      "apiKey": "YOUR_API_KEY",
      "models": [
        {
          "id": "gemini-2.5-pro",
          "name": "Gemini 2.5 Pro"
        }
      ]
    }
  ],
  "currentModel": {
    "id": "gemini-2.5-pro",
    "providerId": "google"
  }
}
```

---

## 📋 الأوامر الأساسية

| الأمر | الوصف |
|-------|-------|
| `zero` | تشغيل الوكيل الذكي |
| `zero /help` | عرض المساعدة |
| `zero /auth` | إعداد المصادقة |

---

## 🌐 Providers مدعومة

- **Google Gemini** - `gemini-2.5-pro`
- **Together AI** - نماذج مجانية
- **Ollama** - نماذج محلية
- **Puter** - مجاني

---

## 📁 الملفات الرئيسية

```
qwen-code/
├── README.md      # التوثيق
├── RUN.md        # هذا الملف
├── zero-tasks/   # تطبيق المهام
├── package.json  # الإعدادات
└── dist/        # الملف المُبنى
```

---

## 🐛 حل المشاكل

### خطأ: "command not found"
```bash
# أضف للمسار
export PATH="$PATH:$(pwd)"
```

### خطأ: إذن مرفوض
```bash
chmod +x dist/cli.js
```

---

**ZERO Agent 🧠** - وكلك الذكي المجاني