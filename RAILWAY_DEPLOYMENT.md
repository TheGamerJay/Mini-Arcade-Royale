# Railway Deployment Reference

Quick reference guide for managing Mini Arcade Royale on Railway.

---

## Live Service

**Production URL**: https://mini-arcade-royale-production.up.railway.app  
**Port**: 8080  
**Region**: US East (Virginia)  
**Status**: Active

---

## Key Information

| Item | Value |
|------|-------|
| Service Name | mini-arcade-royale |
| GitHub Repo | TheGamerJay/Mini-Arcade-Royale |
| Branch Connected | main |
| Auto-Deploy | ✅ Enabled |
| Public Domain | mini-arcade-royale-production.up.railway.app |
| Private Domain | mini-arcade-royale.railway.internal |
| Health Check Endpoint | `/api/health` |
| Restart Policy | On Failure (max 10 retries) |

---

## Quickstart Deployment

### Automatic Deploy (Recommended)

```bash
# Clone repo
git clone https://github.com/TheGamerJay/Mini-Arcade-Royale.git
cd Mini-Arcade-Royale

# Make changes
# ... edit files ...

# Commit and push to main
git add .
git commit -m "feature: description"
git push origin main

# Railway auto-deploys within 2-3 minutes
# Check status: https://railway.app/dashboard
```

### Manual Deploy

If you need to trigger a manual deployment:

1. Go to https://railway.app/dashboard
2. Click "mini-arcade-royale" service
3. Click "Deploy" button (or "Redeploy" for latest commit)

---

## Environment Variables

### Add New Variable

1. Go to https://railway.app/dashboard
2. Select "mini-arcade-royale" service
3. Click "Variables" tab
4. Click "Add Variable"
5. Enter key → value
6. Click "Deploy" to apply changes

### Essential Variables

```
APP_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/arcade_royale
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_... (frontend only)
JWT_SECRET=<random 32+ char string>
SESSION_SECRET=<random 32+ char string>
RESEND_API_KEY=re_...
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

### View Current Variables

1. Railway dashboard → mini-arcade-royale
2. "Variables" tab → Shows all keys (values hidden for security)

---

## Monitoring

### View Logs

```bash
# Via Railway dashboard
# https://railway.app/dashboard → mini-arcade-royale → Logs

# Live tail (last 100 lines)
# Search by keyword
# Filter by timestamp
```

### Health Checks

Railway periodically calls `/api/health` to verify service is up.

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-04-03T20:30:00Z",
  "version": "0.1.0"
}
```

---

## Scaling

### Horizontal Scaling (Add Replicas)

**Problem**: Too much traffic, high latency  
**Solution**: Add replicas for load balancing

```
Railway Dashboard → mini-arcade-royale → Scale → Replicas
Current: 1
Change to: 2 or 3
```

Each replica = independent container instance. Railway automatically distributes traffic.

### Vertical Scaling (More CPU/Memory)

**Problem**: Single replica can't handle load (high CPU usage)  
**Solution**: Increase resources per replica

```
Railway Dashboard → mini-arcade-royale → Replica Limits
CPU: Increase from current to higher value (max 32 vCPU)
Memory: Increase from current to higher value (max 32 GB)
```

---

## Logging & Troubleshooting

### Common Issues

#### Deployment Failed

```
Check:
1. GitHub Actions log (https://github.com/TheGamerJay/Mini-Arcade-Royale/actions)
   Look for test failures or lint errors
2. Railway build log (https://railway.app → mini-arcade-royale → Build Logs)
   Look for missing dependencies or config errors
3. Check for missing environment variables
```

#### Service is Down

```
Check:
1. Railway status page: https://status.railway.app
2. Recent deployment log: https://railway.app → mini-arcade-royale → Logs
3. Check if health check endpoint is working:
   curl https://mini-arcade-royale-production.up.railway.app/api/health
```

#### High Memory/CPU Usage

```
Check:
1. Is database query slow? Check query logs
2. Are there infinite loops or memory leaks?
3. Scale up replica resources or add more replicas
```

#### Environment Variable Not Applied

```
Fix:
1. Make sure you clicked "Deploy" after adding/editing variables
2. Wait 2-3 minutes for deployment to complete
3. Check Railway dashboard confirmation message
```

---

## Database

### Connect to PostgreSQL (if using Railway PostgreSQL)

Railway automatically provides `DATABASE_URL` environment variable.

**Connection String Format**:
```
postgresql://user:password@host:5432/database_name
```

### Backup Database

Rail way handles automated backups. Check Railway dashboard for backup settings.

### Manual Queries

```bash
# From your machine (if DB is public)
psql $DATABASE_URL

# Or use Railway CLI
railway --service mini-arcade-royale shell psql
```

---

## Domain & DNS

### Current Setup

- Railway domain (live now): mini-arcade-royale-production.up.railway.app
- Custom domain: (not yet configured)

### Add Custom Domain

1. Own a domain (e.g., api.mini-arcade-royale.com)
2. Railway dashboard → mini-arcade-royale → Networking → Custom Domain
3. Enter domain name
4. Railway gives you SSL certificate automatically
5. Update DNS records (A record or CNAME)

---

## Rollback

### If Latest Deployment Has Issues

```
Option 1: Redeploy previous commit
1. Go to Railway dashboard
2. Click "mini-arcade-royale"
3. View deployment history
4. Click on previous successful deployment
5. Click "Redeploy"

Option 2: Revert Git commit and push
git revert HEAD
git push origin main
(Railway auto-deploys the revert)
```

---

## CI/CD Pipeline

GitHub Actions runs automatically on every push:

1. **Backend Tests** - Run pytest suite
2. **Frontend Tests** - Run npm test
3. **Lint** - Check code quality (flake8, ESLint)
4. **Deploy** - If all tests pass and branch is `main`

### View Pipeline Status

- GitHub: https://github.com/TheGamerJay/Mini-Arcade-Royale/actions
- After successful tests, Railway automatically deploys

---

## Cost Management

### Monitor Usage

Railway bills based on:
- CPU usage (vCPU-hours)
- Memory usage (GB-hours)
- Bandwidth (GB transferred)
- Database size (GB stored)

### Reduce Costs

1. Use 1 replica (not 2-3) unless needed
2. Keep CPU/Memory at minimum required
3. Use Railway's serverless option (scales to zero on inactivity)
4. Archive old deployment logs

---

## Safety Checklists

### Before Deployment

- [ ] Tests passing (GitHub Actions green)
- [ ] No hardcoded secrets in code
- [ ] Environment variables set in Railway
- [ ] Database migrations ready
- [ ] Backup of database taken (if production data)

### After Deployment

- [ ] Service is up (health check endpoint working)
- [ ] No errors in logs
- [ ] API endpoints responding correctly
- [ ] Database connectivity verified
- [ ] Stripe webhooks receiving events

---

## Support & Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Status](https://status.railway.app)
- [GitHub Issues](https://github.com/TheGamerJay/Mini-Arcade-Royale/issues)
- [Mini Arcade Royale Docs](../README.md)
