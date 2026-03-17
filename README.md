# 🌐 BhashaBridge

**Speak Any Language. Bank Without Barriers.**

BhashaBridge is a real-time AI-powered multilingual voice assistant built for Indian bank branches. It enables frontline bank staff to serve customers in any Indian language — instantly, without any language training.

Built for **iDEA 2.0** — Union Bank of India's Premier Hackathon 2026.

---

## The Problem

430 million Indians speak languages their bank staff don't understand. Every day, customers walk out of branches unserved — not because the bank failed them, but because nobody could talk to them.

---

## The Solution

BhashaBridge sits on any existing branch tablet. When a customer speaks in their language:

1. AI transcribes and translates speech to English instantly
2. Staff sees the translation, detected intent, and a suggested response
3. AI speaks the reply back to the customer in their language
4. A bilingual branch record is auto-generated at the end

No new hardware. No language training. No manual paperwork.

---

## Features

- 🎙️ Real-time speech recognition in 9 Indian languages
- 🌐 Instant English translation for bank staff
- 🏷️ Banking intent detection — Loan, Account Balance, KYC, and more
- 😊 Live customer sentiment analysis
- 📋 Step-by-step process guidance for staff
- 🔊 AI voice reply to customer in their language
- 📊 Live branch analytics dashboard
- 📄 One-click bilingual interaction summary
- 🎭 Demo Mode for each language — no mic needed

---

## Languages Supported

English · Hindi · Tamil · Telugu · Bengali · Marathi · Gujarati · Kannada · Malayalam

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| AI / LLM | Groq API — Llama 3.3 70B |
| Speech Input | Chrome Web Speech API |
| Voice Output | Google Translate TTS |
| Backend | Node.js + Express |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js v18+
- Google Chrome
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Run Locally
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/bhasha-bridge.git
cd bhasha-bridge

# Install dependencies
npm install

# Start the backend server
node server.js

# In a second terminal, start the frontend
npm run dev
```

Open `http://localhost:5173` in Chrome. Enter your Groq API key and launch.

---

## Project Structure
```
bhasha-bridge/
├── api/              # Vercel serverless functions
│   ├── chat.js       # Groq AI endpoint
│   └── tts.js        # Google TTS proxy
├── src/
│   └── App.jsx       # Main React application
├── server.js         # Local development backend
├── vercel.json       # Vercel deployment config
└── index.html
```

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeploy.
```bash
git add .
git commit -m "your message"
git push
```

---

## The Impact

| Metric | Value |
|--------|-------|
| Languages covered | 9 |
| India's population covered | 95%+ |
| Daily paperwork saved per branch | 6+ hours |
| Target market | 1.5 lakh+ bank branches in India |
| Monthly price per branch | ₹5,000 |

---

## Team

Built with ❤️ for iDEA 2.0 — PSBs Hackathon Series 2026
Presented by Union Bank of India · Guided by DFS & IBA

---

## License

MIT
