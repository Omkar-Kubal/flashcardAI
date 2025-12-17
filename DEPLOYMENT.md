# Deploying BrainDeck to Railway

This guide walks you through deploying your Flask flashcard application to Railway.

## Prerequisites

- [Railway account](https://railway.app/) (sign up with GitHub)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional, for command-line deployment)
- Git repository initialized (already done ✓)

## Step 1: Push to GitHub

1. **Create a new repository** on GitHub (if you haven't already)
2. **Push your code**:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

## Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `Flash-Card` repository
5. Railway will automatically detect it's a Python app

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "Add PostgreSQL"**
3. Railway will automatically:
   - Provision a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Link it to your application

## Step 4: Configure Environment Variables

In Railway dashboard, go to your app service → **Variables** tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `FLASK_ENV` | `production` | Sets the app to production mode |
| `SECRET_KEY` | `<generate-random-key>` | **CRITICAL**: Use a secure random key (see below) |
| `GEMINI_API_KEY` | `<your-key>` | Your Google Gemini API key |
| `GROQ_API_KEY` | `<your-key>` | Your Groq API key (if using) |

### Generate a Secure SECRET_KEY

Run this locally and copy the output:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

> [!IMPORTANT]
> Railway automatically provides `DATABASE_URL` for PostgreSQL - **do not set it manually**.

## Step 5: Deploy

Railway will automatically deploy when you push to GitHub. Watch the deployment logs in the Railway dashboard.

## Step 6: Initialize Database

After the first deployment, you need to create database tables:

1. In Railway dashboard, go to your app service
2. Click **"Settings" → "Deploy Logs"** or open the **Shell** tab
3. Run database migrations:
   ```bash
   flask db upgrade
   ```

   Or if Flask-Migrate isn't initialized:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

## Step 7: Access Your App

1. In Railway dashboard, go to **"Settings"**
2. Click **"Generate Domain"** to get a public URL
3. Your app will be live at `https://your-app-name.up.railway.app`

## Troubleshooting

### Build Failures

**Error**: `ModuleNotFoundError`
- **Fix**: Ensure all dependencies are in `requirements.txt`
- Run locally: `pip freeze > requirements.txt`

**Error**: `Python version not found`
- **Fix**: Check `runtime.txt` matches your Python version
- Current: `python-3.12.3`

### Database Connection Issues

**Error**: `could not connect to server`
- **Fix**: Ensure PostgreSQL service is running in Railway
- Check that services are linked in Railway dashboard

**Error**: `relation does not exist`
- **Fix**: Run database migrations (see Step 6)

### SECRET_KEY Errors

**Error**: `Please set a secure SECRET_KEY in production!`
- **Fix**: Set `SECRET_KEY` environment variable in Railway (see Step 4)

### App Won't Start

1. Check deploy logs in Railway dashboard
2. Ensure `Procfile` exists and is correct: `web: gunicorn run:app`
3. Verify `FLASK_ENV=production` is set

## Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Watch the deployment in Railway dashboard.

## Monitoring

- **Logs**: Railway dashboard → Your service → Deploy Logs
- **Metrics**: Railway dashboard → Your service → Metrics tab
- **Database**: Railway dashboard → PostgreSQL service

## Database Management

### Backup Database
Railway provides automatic backups for paid plans. For manual backup:

```bash
# In Railway shell
pg_dump $DATABASE_URL > backup.sql
```

### View Database
In Railway dashboard → PostgreSQL service → Data tab

## Cost Estimates

- **Free Tier**: $5 credit/month (good for small apps)
- **Hobby Plan**: $5/month (500 hours execution)
- **Pro Plan**: Pay-as-you-go

Your app will likely stay within free tier limits during development.

## Next Steps

After deployment:
1. ✅ Test user registration and login
2. ✅ Create a deck and add flashcards
3. ✅ Test AI features (if API keys configured)
4. ✅ Set up custom domain (optional, in Railway settings)
5. ✅ Configure CORS if building separate frontend

## Useful Commands (Railway CLI)

Install Railway CLI:
```bash
npm i -g @railway/cli
```

Login and link:
```bash
railway login
railway link
```

View logs:
```bash
railway logs
```

Run shell:
```bash
railway shell
```

Deploy manually:
```bash
railway up
```
