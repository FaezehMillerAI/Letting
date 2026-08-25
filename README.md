# 🏡 LettingsPulse Exeter

**24/7 Autonomous AI Lettings Agent & Operating Suite for Student Accommodation Agencies in Exeter, UK.**

---

## ⚡ Quick Start

### 1. Run the Local Server & Simulator
```powershell
# Activate virtual environment and run
.venv\Scripts\python.exe run.py
```

Open your browser to **`http://localhost:8000`** to access:
- 📱 **Interactive WhatsApp Phone Simulator** (Live student chat with Exeter HMO recommendations).
- 📊 **Agency Performance Dashboard** (Real-time leads, booked viewings, and pipeline revenue).
- 🏡 **Exeter Properties Inventory** (Victoria St, Mount Pleasant, Longbrook St, Howell Rd, etc.).
- 📅 **Booked Viewings Calendar** (Confirmed group viewings with contact info).
- 💻 **One-Line Web Widget Embed Script**.

### 2. Run Automated Integration Tests
```powershell
.venv\Scripts\python.exe test_agent.py
```

---

## 📁 Project Architecture

```
Lettings/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app & route mounting
│       ├── config.py            # Environment configuration
│       ├── database.py          # SQLAlchemy SQLite / PostgreSQL engine
│       ├── models.py            # Database schema (Agency, Property, Conversation, ViewingBooking)
│       ├── schemas.py           # Pydantic request/response schemas
│       ├── seed.py              # Exeter student properties dataset
│       ├── agent/
│       │   ├── core.py          # Conversational agent & state reasoning engine
│       │   ├── prompts.py       # Exeter domain prompts (Streatham, St Luke's, pppw)
│       │   └── tools.py         # Property search, slot checking, and booking tools
│       ├── routes/
│       │   ├── chat.py          # Web chat widget endpoint
│       │   ├── webhook.py       # WhatsApp Twilio webhook endpoint
│       │   ├── properties.py    # Property inventory management
│       │   ├── viewings.py      # Scheduled viewing management
│       │   └── dashboard.py     # Real-time agency analytics
│       └── static/              # Interactive Simulator & Dashboard frontend
│           ├── index.html
│           ├── app.js
│           ├── styles.css
│           └── widget.js
├── run.py                       # One-command server runner
├── test_agent.py                # Automated end-to-end test suite
├── PITCH_DECK_EXETER.md         # 1-page walk-in sales cheat sheet for Longbrook St
└── requirements.txt             # Project dependencies
```

---

## 📞 WhatsApp Live Deployment (Twilio / Meta)

1. Set your Twilio credentials in `.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
2. Expose your local port via Ngrok / Cloudflare:
   ```bash
   ngrok http 8000
   ```
3. Set your Twilio WhatsApp Sandbox webhook to:
   `https://your-ngrok-url.ngrok-free.app/api/webhook/whatsapp`
