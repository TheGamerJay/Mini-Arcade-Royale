# Mini Arcade Royale - Unified Deployment (Frontend + Backend on Railway)

## 🚀 What Changed

Both frontend (Next.js) and backend (FastAPI) now deploy as a **single unified service** on Railway:

```
Railway Container (8080)
  ├─ Nginx (reverse proxy on 8080)
  ├─ Backend (uvicorn on 127.0.0.1:8000)
  └─ Frontend (Next.js on 127.0.0.1:3000)
```

## 📊 Architecture

```
User → Railway Service (8080)
  ↓
Nginx Reverse Proxy
  ├─ /api/* → Backend (8000)
  ├─ /docs, /redoc → Backend (8000)
  └─ /* → Frontend (3000)
```

## ✅ How to Deploy

### Option 1: Railway (Recommended)
1. Go to **https://railway.app** dashboard
2. Select your **Mini Arcade Royale** project
3. Delete old services (if any, keep database)
4. Create **New Service** → Connect GitHub
5. Repo: `TheGamerJay/Mini-Arcade-Royale`
6. Root directory: `/` (root)
7. Add environment variables:
   ```
   DATABASE_URL=postgresql://...  (from Railway Postgres)
   JWT_SECRET=your-secret-key
   STRIPE_API_KEY=sk_test_...
   RESEND_API_KEY=your-key
   ```
8. Deploy

### Option 2: Local Testing
```bash
docker-compose down  # stop old services
docker-compose up --build  # rebuild with new Dockerfile
# Open: http://localhost:8080
```

## 📍 Your Game Will Be At

- **Frontend**: http://your-railway-url/ (automatically routed)
- **API Docs**: http://your-railway-url/docs
- **API Health**: http://your-railway-url/api/health

## 🔧 How It Works

1. **Dockerfile** builds both Node frontend + Python backend
2. **Nginx** listens on 8080, routes requests:
   - `/api/*` → Backend
   - `/docs`, `/redoc` → Backend  
   - `/*` → Frontend
3. **start.sh** starts all 3 services:
   - Backend (8000)
   - Frontend (3000)
   - Nginx (8080)

## ✨ Benefits

✅ Single Railway service (cheaper)
✅ No CORS issues (same domain)
✅ Scalable (just increase Railway compute)
✅ Simple deployment (one Dockerfile)
✅ Game + API on one URL

## 🐛 Troubleshooting

If services don't start:
```bash
# Check logs in Railway dashboard
# Or locally:
docker-compose logs -f
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

## Done! ✅

Push to main → Railway auto-deploys → Game is live in 2-3 minutes
