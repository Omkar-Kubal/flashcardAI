# 🧠 BrainDeck

**AI-Powered Flashcard Learning Platform**

BrainDeck is a modern web application that revolutionizes studying through intelligent flashcard generation and spaced repetition learning.

---

## 🏗️ Project Structure

```
Flash-Card/
├── app/                    # Flask Backend (REST API)
│   ├── __init__.py         # App factory
│   ├── config.py           # Configuration
│   ├── auth/               # JWT authentication
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   └── services/           # AI services (Gemini)
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Pages (dashboard, decks, study, etc.)
│   │   ├── components/     # React components (Sidebar, Header)
│   │   └── lib/            # API client, auth, types
│   └── package.json
├── instance/               # SQLite database
├── requirements.txt        # Python dependencies
├── run.py                  # Flask entry point
└── .env                    # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### 1. Backend Setup (Flask API)

```bash
# Clone and navigate
git clone https://github.com/yourusername/BrainDeck.git
cd BrainDeck

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Run backend
flask run
```

Backend runs at: **http://localhost:5000**

### 2. Frontend Setup (Next.js)

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## ✨ Features

- **AI Flashcard Generation**: Paste text or search topics → AI creates flashcards
- **Spaced Repetition**: Smart scheduling for optimal memory retention
- **Deck Management**: Organize cards by topic with progress tracking
- **Study Sessions**: Interactive flip-card review with difficulty rating
- **Modern UI**: Dark theme with yellow accents (Stitch design)

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Flask, Python 3.12 |
| **Database** | SQLite + SQLAlchemy |
| **Auth** | JWT (Flask-JWT-Extended) |
| **AI** | Google Gemini API |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/flashcards` | List flashcards |
| POST | `/api/flashcards` | Create flashcard |
| GET | `/api/flashcards/decks` | List decks |
| POST | `/api/flashcards/decks` | Create deck |
| GET | `/api/study/session` | Start study session |
| POST | `/api/study/answer` | Submit answer |
| POST | `/api/ai/generate` | Generate flashcards with AI |
| GET | `/api/users/dashboard` | Get dashboard data |

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.
