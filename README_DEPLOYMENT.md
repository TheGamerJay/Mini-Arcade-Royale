# Deployment Guide

Production deployment and infrastructure setup for Mini Arcade Royale.

**Environment**: Production (Staging, Pre-Release)  
**Target**: Cloud-native, containerized, scalable  
**Downtime Target**: Zero-downtime deployments where possible  

---

## 🚀 Current Production Deployment: Railway

**Status**: ✅ Live  
**URL**: https://mini-arcade-royale-production.up.railway.app  
**Port**: 8080  
**Region**: US East (Virginia)  
**Replicas**: 1  
**GitHub Integration**: TheGamerJay/Mini-Arcade-Royale (main branch, auto-deploy enabled)  

### Quick Links
- [Railway Dashboard](https://railway.app) (Settings, logs, environment variables)
- [GitHub Integration](https://github.com/TheGamerJay/Mini-Arcade-Royale) (Push to main → auto-deploy)
- [Service Logs](https://railway.app/dashboard) (Real-time deployment logs)

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Environment Variables](#environment-variables)
7. [SSL/TLS & HTTPS](#ssltls--https)
8. [Domain & DNS](#domain--dns)
9. [Email Configuration](#email-configuration)
10. [Stripe Live Integration](#stripe-live-integration)
11. [Monitoring & Observability](#monitoring--observability)
12. [Backup & Recovery](#backup--recovery)
13. [Deployment Commands](#deployment-commands)
14. [Rollback Procedures](#rollback-procedures)
15. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### Code Quality & Testing

- [ ] All tests passing: `pytest tests/ -v --cov`
- [ ] Frontend tests passing: `npm test`
- [ ] No console errors or warnings
- [ ] No `console.log()` left in code
- [ ] No hardcoded secrets or API keys
- [ ] No `TODO` or `FIXME` comments in critical paths
- [ ] Code reviewed by 2+ team members
- [ ] Branch protection rules enforced

### Security & Compliance

- [ ] SSL certificate obtained and valid
- [ ] HTTPS enabled and redirects HTTP
- [ ] CSRF tokens implemented on all forms
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Input validation tested on all API endpoints
- [ ] Password hashing confirmed (bcrypt/argon2)
- [ ] Rate limiting enabled on auth & play routes
- [ ] Stripe live keys verified (not test keys)
- [ ] Webhook signatures verified
- [ ] CORS configured correctly (not wildcards)
- [ ] `.env` template reviewed (no exposed secrets)

### Database Readiness

- [ ] All migrations tested locally
- [ ] Migration rollback tested
- [ ] Database backups scheduled
- [ ] Connection pooling configured
- [ ] Indexes created on high-query tables
- [ ] Query performance verified
- [ ] Foreign key constraints verified

### Infrastructure & DevOps

- [ ] Docker images built and tested
- [ ] Container registry access confirmed
- [ ] Kubernetes manifests validated (if using K8s)
- [ ] Load balancer configured
- [ ] CDN configured for static assets
- [ ] Email provider (Resend/SendGrid) verified
- [ ] Monitoring/alerting stack ready (Sentry, DataDog, etc.)
- [ ] Log aggregation configured
- [ ] Health check endpoints implemented

### Legal & Compliance

- [ ] Legal pages deployed and accessible
- [ ] Terms of Service link works
- [ ] Privacy Policy link works
- [ ] Credits Policy (non-redemption) clearly stated
- [ ] Age verification in place (if required)
- [ ] GDPR data retention policy documented
- [ ] Refund policy aligned with platform rules
- [ ] Support email configured

### Operational

- [ ] Admin dashboard functional
- [ ] Admin user(s) created
- [ ] Runbook created (see `/ops/DEPLOYMENT_RUNBOOK.md`)
- [ ] On-call rotation setup
- [ ] Incident response plan documented
- [ ] Support team briefed
- [ ] Marketing team prepared with launch plan
- [ ] Customer communication ready

---

## Infrastructure Setup

### ✅ Option 0: Railway (Current Production Setup)

**Status**: Live at https://mini-arcade-royale-production.up.railway.app

#### What's Already Done

1. **GitHub Connected**
   - Repository: TheGamerJay/Mini-Arcade-Royale
   - Branch: `main` (any push triggers auto-deploy)
   - Status: Auto-deployments enabled

2. **Service Configured**
   - Port: 8080 (configurable in Railway dashboard)
   - Region: US East (Virginia)
   - Replicas: 1 (can add more for scaling)
   - Builder: Railpack (Railway's default builder)

3. **Public Domain**
   - `mini-arcade-royale-production.up.railway.app` (live now)
   - Custom domain: Can be added via Railway dashboard

#### How to Deploy

**Automatic** (Recommended)
```bash
# Push to main branch → Railway auto-deploys in ~2-3 minutes
git add .
git commit -m "feature: new game mode"
git push origin main
```

**Manual** (If needed)
1. Go to https://railway.app/dashboard
2. Select "mini-arcade-royale" service
3. Click "Deploy" or "Redeploy" button

#### Environment Variables in Railway

1. Go to Railway dashboard → mini-arcade-royale service
2. Click "Variables" tab
3. Add:
   - `DATABASE_URL`: PostgreSQL connection string
   - `STRIPE_SECRET_KEY`: Stripe secret key (test or live)
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret
   - `RESEND_API_KEY`: Email provider key
   - `JWT_SECRET`: Random 32-char string for JWT signing
   - `SESSION_SECRET`: Random 32-char string for sessions
   - Any other environment variables from `.env.example`

4. Click "Deploy" after adding/updating variables

#### Scaling in Railway

**Add More Replicas** (Horizontal scaling)
1. Railway dashboard → mini-arcade-royale service
2. Scale section → Replicas
3. Increase from 1 to 2, 3, etc.
4. Each replica = independent container instance
5. Railway automatically load-balances traffic

**Increase Resource Limits** (Vertical scaling)
1. Railway dashboard → Replica Limits
2. Increase CPU (up to 32 vCPU per plan)
3. Increase Memory (up to 32 GB per plan)

**Zero-Downtime Deployments**
- Railway automatically manages rolling updates
- Old replica stops after new one is healthy
- No downtime during deployments

#### Monitoring Logs

```bash
# View live logs
# https://railway.app/dashboard
# Click "mini-arcade-royale" service → "Logs" tab
# Tail last 100 lines, search by keyword
```

#### Database (PostgreSQL on Railway)

Railway can host PostgreSQL directly:
1. Create new plugin: PostgreSQL
2. Link to mini-arcade-royale service
3. Get connection string automatically as `DATABASE_URL` env var

#### Add Custom Domain

1. Railway dashboard → mini-arcade-royale → Networking
2. Add domain (e.g., `api.mini-arcade-royale.com`)
3. Point DNS A record to Railway IP
4. SSL certificate auto-generated

---

### Option A: Vercel + Managed Services (Frontend Alternative)


#### Frontend: Vercel

1. **Connect GitHub**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Import repository

2. **Configure Project**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Environment: Production

3. **Set Environment Variables**
   - `NEXT_PUBLIC_API_URL`: `https://api.mini-arcade-royale.com`
   - Any other `NEXT_PUBLIC_*` variables

4. **Deploy**
   - Automatically deploys on push to `main`
   - Gets automatic HTTPS, CDN, etc.

#### Backend: Cloud Run / App Engine / Heroku

**Google Cloud Run (Recommended)**

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Create project
gcloud projects create arcade-royale-prod

# Enable services
gcloud services enable run.googleapis.com
gcloud services enable cloudsql.googleapis.com

# Deploy backend container
gcloud run deploy arcade-royale-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60s
```

### Option B: Docker + Kubernetes (Production-Grade)

#### Build Docker Images

**Backend Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

#### Push to Container Registry

```bash
# Build images
docker build -t backend backend/
docker build -t frontend frontend/

# Tag for registry
docker tag backend gcr.io/arcade-royale/backend:latest
docker tag frontend gcr.io/arcade-royale/frontend:latest

# Push (example: Google Container Registry)
gcloud auth configure-docker
docker push gcr.io/arcade-royale/backend:latest
docker push gcr.io/arcade-royale/frontend:latest
```

#### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace arcade-royale

# Create secrets
kubectl create secret generic arcade-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=STRIPE_SECRET_KEY=sk_live_... \
  -n arcade-royale

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n arcade-royale

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml -n arcade-royale

# Expose services
kubectl apply -f k8s/services.yaml -n arcade-royale

# Check status
kubectl get pods -n arcade-royale
kubectl get svc -n arcade-royale
```

### Option C: Self-Hosted (VPS)

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/your-org/arcade-royale.git
cd arcade-royale

# Copy .env
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

---

## Database Deployment

### PostgreSQL Managed Services (Recommended)

#### AWS RDS

```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier arcade-royale-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.5 \
  --master-username arcade_prod \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20 \
  --storage-type gp2 \
  --multi-az \
  --publicly-accessible false \
  --backup-retention-period 30
```

#### Google Cloud SQL

```bash
gcloud sql instances create arcade-db \
  --database-version POSTGRES_14 \
  --tier db-custom-2-8192 \
  --availability-type REGIONAL
```

#### Heroku Postgres

```bash
heroku addons:create heroku-postgresql:standard-0 \
  --app arcade-royale
```

### Initial Setup

```bash
# Get connection string from cloud provider

# Connect to database
psql $DATABASE_URL

# Create schemas / extensions (if needed)
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

# Run migrations
alembic upgrade head

# Verify
\dt
```

---

## Backend Deployment

### Uvicorn Production Server

```bash
# Use Gunicorn with Uvicorn workers for production
pip install gunicorn

# Run with Gunicorn
gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  app.main:app
```

### Environment Variables (Production)

```env
# App
APP_ENV=production
FRONTEND_URL=https://mini-arcade-royale.com
BACKEND_URL=https://api.mini-arcade-royale.com

# Database
DATABASE_URL=postgresql://arcade_prod:PASSWORD@rds-instance.amazonaws.com:5432/arcade_royale

# Security
SECURE_COOKIES=true
COOKIE_DOMAIN=.mini-arcade-royale.com
SESSION_SECRET=<64-char-random>
JWT_SECRET=<64-char-random>
CSRF_SECRET=<64-char-random>

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_live_...
EMAIL_FROM=noreply@mini-arcade-royale.com
SUPPORT_EMAIL=support@mini-arcade-royale.com
ADMIN_EMAIL=admin@mini-arcade-royale.com

# Observability
LOG_LEVEL=INFO
SENTRY_DSN=https://key@sentry.io/project-id

# Feature flags
FEATURE_FLAGS={"membership":true,"events":false}
```

### Deployment Steps

```bash
# 1. Build Docker image
docker build -t arcade-backend:v1.0.0 backend/

# 2. Push to registry
docker push gcr.io/arcade-royale/backend:v1.0.0

# 3. Deploy (Cloud Run example)
gcloud run deploy arcade-api \
  --image gcr.io/arcade-royale/backend:v1.0.0 \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --memory 512Mi

# 4. Verify deployment
curl https://api.mini-arcade-royale.com/health
```

---

## Frontend Deployment

### Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel deploy --prod
```

### Custom Hosting

```bash
# Build static Next.js export
cd frontend
npm run build
npm run export  # Generates static pages

# Upload to S3 + CloudFront
aws s3 sync out/ s3://mini-arcade-royale-static/
```

---

## Environment Variables

### Production `.env` Template

Create `.env.production` (not committed):

```env
APP_NAME=Mini Arcade Royale
APP_ENV=production
APP_URL=https://mini-arcade-royale.com
FRONTEND_URL=https://mini-arcade-royale.com
BACKEND_URL=https://api.mini-arcade-royale.com

# Database
DATABASE_URL=postgresql://arcade_prod:XXX@prod-db.amazonaws.com:5432/arcade_royale

# Cache
REDIS_URL=redis://prod-redis.amazonaws.com:6379/0

# Security
SESSION_SECRET=<generated-secret>
JWT_SECRET=<generated-secret>
CSRF_SECRET=<generated-secret>

# Stripe LIVE
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...(live)

# Email
RESEND_API_KEY=re_live_...
EMAIL_FROM=noreply@mini-arcade-royale.com
SUPPORT_EMAIL=support@mini-arcade-royale.com
ADMIN_EMAIL=admin@mini-arcade-royale.com

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=https://key@sentry.io/project

# Deployment
SECURE_COOKIES=true
COOKIE_DOMAIN=.mini-arcade-royale.com
RATE_LIMIT_CONFIG={"auth":5,"play":10}
```

### Secret Management

- **AWS Secrets Manager** (recommended)
  ```bash
  aws secretsmanager create-secret \
    --name arcade/prod/secrets \
    --secret-string '{"DATABASE_URL":"...","STRIPE_SECRET_KEY":"..."}'
  ```

- **Kubernetes Secrets**
  ```bash
  kubectl create secret generic arcade-secrets \
    --from-literal=DATABASE_URL=... \
    -n arcade-royale
  ```

- **HashiCorp Vault** (enterprise)

---

## SSL/TLS & HTTPS

### Obtain SSL Certificate

#### Automatic (Recommended)

- **Vercel**: Automatic HTTPS out of box
- **Cloud Run**: Automatic managed certificate
- **Let's Encrypt + Certbot**:
  ```bash
  sudo certbot certonly --standalone -d mini-arcade-royale.com
  ```

#### Manual

- Order from Certificate Authority (DigiCert, Comodo, etc.)
- Upload to cloud provider

### Configure HTTPS

#### AWS ALB

```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

#### Nginx

```nginx
server {
  listen 443 ssl http2;
  server_name mini-arcade-royale.com;

  ssl_certificate /etc/ssl/certs/cert.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # HTTP/2 Push
  http2_push_resource /assets/app.js;

  location / {
    proxy_pass http://backend:8000;
  }
}

server {
  listen 80;
  server_name mini-arcade-royale.com;
  return 301 https://$server_name$request_uri;
}
```

---

## Domain & DNS

### Register Domain

1. Register at GoDaddy, Namecheap, Route 53, etc.
2. Configure nameservers to your provider

### DNS Records

```
Type    Subdomain   Value
A       @           <Static IP or Load Balancer IP>
A       www         <Static IP>
A       api         <Backend API IP>
MX      @           mail.mini-arcade-royale.com (priority 10)
TXT     @           v=spf1 include:sendgrid.net ~all
TXT     @           (DKIM record from email provider)
CNAME   *.cdn       (CDN CNAME if using)
```

### Example: AWS Route 53

```bash
aws route53 create-resource-record-set \
  --hosted-zone-id Z123456 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "mini-arcade-royale.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "1.2.3.4"}]
      }
    }]
  }'
```

---

## Email Configuration

### Resend (Recommended)

```bash
# Sign up: https://resend.com
# Verify domain
# Get API key

# Store in .env
RESEND_API_KEY=re_live_abc123...
EMAIL_FROM=noreply@mini-arcade-royale.com
```

### SendGrid Alternative

```bash
SENDGRID_API_KEY=SG.abc123...
```

### SPF, DKIM, DMARC

```bash
# Add to DNS:
v=spf1 include:resend.net ~all
# DKIM key from Resend Dashboard
# DMARC policy
_dmarc.mini-arcade-royale.com  v=DMARC1; p=none; rua=mailto:admin@mini-arcade-royale.com
```

---

## Stripe Live Integration

### Switch to Live Keys

1. **Get Live Keys**
   - Log in to Stripe Dashboard
   - Developers → API Keys
   - Copy `pk_live_...` and `sk_live_...`

2. **Update Environment**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...(live)
   ```

3. **Configure Webhook**
   - Dashboard → Developers → Webhooks
   - Add Endpoint: `https://api.mini-arcade-royale.com/api/webhooks/stripe`
   - Events: `charge.succeeded`, `charge.refunded`
   - Copy signing secret

4. **Test**
   ```bash
   # Use real test card
   # 4242 4242 4242 4242  (Visa test)
   # 378282246310005      (Amex test)
   # See: https://stripe.com/docs/testing
   ```

---

## Monitoring & Observability

### Application Monitoring

#### Sentry (Error Tracking)

```bash
# Install in backend
pip install sentry-sdk[fastapi]

# Configure
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
  dsn="https://key@sentry.io/project",
  integrations=[FastApiIntegration()],
  traces_sample_rate=0.1,
  environment="production"
)
```

#### Datadog (Full Observability)

```bash
# Agent setup
curl -Ls https://install.datadoghq.com/datadog-agent/scripts/install_unix_agent.sh | bash

# Or Docker
docker run -d --name dd-agent \
  --hostname arcade-prod \
  -e DD_API_KEY=$DD_API_KEY \
  gcr.io/datadoghq/agent:latest
```

### Logs

#### Structured Logging

```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "service": "arcade-api"
        }
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger()
logger.addHandler(handler)
```

#### Log Aggregation

- **AWS CloudWatch**: Automatic for AWS services
- **Google Cloud Logging**: Automatic for Cloud Run
- **ELK Stack**: Self-hosted elastic search
- **Splunk**: Enterprise logging

### Metrics

```python
from prometheus_client import Counter, Histogram

play_counter = Counter('game_plays_total', 'Total game plays', ['game'])
credit_histogram = Histogram('credit_transactions', 'Credit transaction amounts')

# In route
play_counter.labels(game='scratch_royale').inc()
```

### Health Checks

```python
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "database": await check_db(),
        "cache": await check_redis(),
        "version": "1.0.0"
    }

@app.get("/ready")
async def readiness_check():
    # More thorough checks for Kubernetes readiness
    try:
        await db.execute("SELECT 1")
        return {"ready": True}
    except Exception as e:
        return {"ready": False, "error": str(e)}, 503
```

### Alerting

#### PagerDuty Integration

```yaml
# Alert: High error rate
- alert: HighErrorRate
  expr: rate(errors_total[5m]) > 0.05
  action: page  # Trigger PagerDuty
```

#### Thresholds

- **Auth failures** > 10 in 1 min: Alert
- **Payment webhook failures** > 5 in 5 min: Alert
- **Database query time** > 5s: Warn
- **CPU** > 80%: Warn
- **Memory** > 90%: Alert
- **Disk** > 95%: Alert

---

## Backup & Recovery

### Database Backups

#### Automated

- AWS RDS: Automatic backups (7-day retention default)
- Google Cloud SQL: Automated backups every 24 hrs

#### Manual Backups

```bash
# pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup.sql s3://arcade-backups/

# Restore
psql $DATABASE_URL < backup.sql
```

#### Backup Retention

- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months
- Test restore monthly

### Disaster Recovery

```bash
# Test restore (monthly)
1. Create temporary instance
2. Restore from backup
3. Run migrations
4. Verify data integrity
5. Delete temporary instance
```

---

## Deployment Commands

### Deploy Backend

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Mini Arcade Royale Backend"

# Build
docker build -t arcade-backend:$VERSION backend/

# Push
docker push gcr.io/arcade-royale/backend:$VERSION

# Tag as latest
docker tag gcr.io/arcade-royale/backend:$VERSION gcr.io/arcade-royale/backend:latest
docker push gcr.io/arcade-royale/backend:latest

# Deploy
kubectl set image deployment/arcade-api \
  arcade-api=gcr.io/arcade-royale/backend:$VERSION \
  -n arcade-royale

# Wait for rollout
kubectl rollout status deployment/arcade-api -n arcade-royale

echo "✅ Backend deployed"
```

### Deploy Frontend

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Mini Arcade Royale Frontend"

cd frontend

# Build
npm run build

# Deploy to Vercel
vercel deploy --prod --token $VERCEL_TOKEN

echo "✅ Frontend deployed"
```

---

## Rollback Procedures

### Kubernetes Rollback

```bash
# View history
kubectl rollout history deployment/arcade-api -n arcade-royale

# Rollback to previous version
kubectl rollout undo deployment/arcade-api -n arcade-royale

# Rollback to specific revision
kubectl rollout undo deployment/arcade-api \
  --to-revision=2 \
  -n arcade-royale
```

### Database Rollback

```bash
# Downgrade to previous migration
alembic downgrade -1

# Or specific revision
alembic downgrade abc123def456
```

### Vercel Rollback

```bash
# In Vercel Dashboard:
# Deployments → Click deployment row → Rollback button
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl https://api.mini-arcade-royale.com/health

# Frontend homepage
curl https://mini-arcade-royale.com

# API readiness
curl https://api.mini-arcade-royale.com/ready
```

### Smoke Tests

```bash
# 1. Signup flow
curl -X POST https://api.mini-arcade-royale.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mini-arcade-royale.com",
    "username": "test_deploy",
    "password": "TempPass123!"
  }'

# 2. Stripe webhook verification
curl -X POST https://api.mini-arcade-royale.com/api/webhooks/stripe \
  -H "stripe-signature: t=<timestamp>,v1=<signature>" \
  -d '{"type":"charge.succeeded",...}'

# 3. Database connectivity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Email sending (check logs)
curl -X POST https://api.mini-arcade-royale.com/api/support/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","message":"test"}'
```

### Functional Tests

- [ ] Sign up with valid credentials
- [ ] Sign up must verify email
- [ ] Login works with email
- [ ] Login works with username
- [ ] Dashboard shows correct balance
- [ ] Purchase flow completes
- [ ] Game play deducts credits
- [ ] Leaderboard loads
- [ ] Admin panel accessible
- [ ] Support tickets create
- [ ] Legal pages display correctly

---

## Runbooks

See `/ops/` directory:
- **[DEPLOYMENT_RUNBOOK.md](../ops/DEPLOYMENT_RUNBOOK.md)** — Step-by-step deploy
- **[INCIDENT_RESPONSE.md](../ops/INCIDENT_RESPONSE.md)** — Handle incidents
- **[MONITORING.md](../ops/MONITORING.md)** — Monitor production
- **[BACKUP_AND_RECOVERY.md](../ops/BACKUP_AND_RECOVERY.md)** — Backup procedures

---

## Questions?

- Check **[context_docs/ops/](../context_docs/ops/)**
- Review **[README.md](../README.md)** for overall architecture
- See **[README_LOCAL_DEV.md](../README_LOCAL_DEV.md)** for local setup
