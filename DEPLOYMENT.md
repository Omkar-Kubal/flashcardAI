# 🚀 BrainDeck Deployment Guide

## ✅ GitHub Ready - YES!

Your project is ready to push to GitHub. All sensitive data is properly gitignored.

### Quick Push to GitHub:

```bash
cd d:\Flash-Card

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Complete BrainDeck app with 14 pages"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/braindeck.git

# Push
git push -u origin main
```

---

## 🔶 Vercel Deployment - SPLIT APPROACH

### ⚠️ Important: Backend NOT on Vercel
Flask is **not recommended** for Vercel (serverless limitations). Use this approach:

### 1. **Frontend → Vercel** ✅
### 2. **Backend → Railway/Render** ✅

---

## 📦 Frontend Deployment (Vercel)

### Step 1: Add Environment Variable

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Step 2: Deploy to Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Project name: braindeck
# - Settings: accept defaults
```

**OR** use Vercel Dashboard:
1. Go to https://vercel.com
2. Import `frontend` folder from GitHub
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

---

## 🚂 Backend Deployment (Railway - Recommended)

### Option A: Railway (Easiest for Flask)

1. **Sign up**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Select** your repo
4. **Root Directory**: Leave as `/` (root)
5. **Add Environment Variables**:
   ```env
   FLASK_ENV=production
   SECRET_KEY=your-super-secret-key-change-this
   GEMINI_API_KEY=your-gemini-api-key
   DATABASE_URL=postgresql://... (Railway will provide)
   ```

6. **Add Start Command** in Railway settings:
   ```bash
   gunicorn run:app
   ```

7. **Add to `requirements.txt`**:
   ```txt
   gunicorn==21.2.0
   psycopg2-binary==2.9.9
   ```

### Option B: Render.com

1. **Sign up**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `gunicorn run:app`
5. **Add Environment Variables** (same as above)

---

## 📋 Pre-Deployment Checklist

### Backend:
- [ ] Add `gunicorn` to `requirements.txt`
- [ ] Add `psycopg2-binary` for PostgreSQL
- [ ] Set environment variables on Railway/Render
- [ ] Update CORS to allow your Vercel domain
- [ ] Test API endpoints once deployed

### Frontend:
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
- [ ] Build locally: `npm run build` (verify no errors)
- [ ] Deploy to Vercel
- [ ] Test all pages after deployment

---

## 🔧 Files to Update for Production

### 1. Backend CORS (`app/__init__.py`)

```python
# Update origins to include production domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://braindeck.vercel.app"  # Add your Vercel URL
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})
```

### 2. Database Migration

Railway/Render use PostgreSQL. Update `app/config.py`:

```python
# Production will use PostgreSQL from environment
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///flashcards.db')

# Fix for Railway's postgres:// vs postgresql://
if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
```

---

## 🎯 Deployment Summary

| Component | Platform | URL Example |
|-----------|----------|-------------|
| **Frontend** | Vercel | `braindeck.vercel.app` |
| **Backend** | Railway | `braindeck-api.railway.app` |
| **Database** | Railway (PostgreSQL) | Auto-provisioned |

---

## ✅ Current Status

**GitHub**: ✅ Ready to push (all secrets in .gitignore)

**Vercel**: ⚠️ Only deploy **frontend** folder
- Backend should go to Railway/Render instead

**Production**: Need to:
1. Push to GitHub
2. Deploy backend to Railway
3. Deploy frontend to Vercel with backend URL

---

## 🚨 What NOT to Deploy to Vercel

- ❌ Flask backend (`app/` folder)
- ❌ SQLite database
- ❌ Python requirements
- ✅ Only deploy `frontend/` folder to Vercel
