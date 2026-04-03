# Local Development Setup Guide

Complete step-by-step guide to running Mini Arcade Royale locally on macOS, Linux, or Windows.

**Time**: ~20–30 minutes  
**Difficulty**: Beginner-friendly  
**Prerequisites**: Python 3.11+, Node.js 18+, PostgreSQL 14+ (or Docker)

---

## Table of Contents

1. [Prerequisites Check](#prerequisites-check)
2. [Clone & Navigate](#clone--navigate)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Migrations & Seeding](#migrations--seeding)
8. [Running Services](#running-services)
9. [First Login](#first-login)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites Check

### Python 3.11+

```bash
python --version
# Expected: Python 3.11.x or higher

# If not installed:
# macOS: brew install python@3.11
# Windows: https://www.python.org/downloads/
# Linux: sudo apt install python3.11 python3.11-venv
```

### Node.js 18+

```bash
node --version
npm --version
# Expected: v18.x or v20.x, npm 9.x or higher

# If not installed:
# macOS: brew install node
# Windows: https://nodejs.org/
# Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs
```

### PostgreSQL 14+ (or Docker)

#### Option A: PostgreSQL Installed Locally

```bash
psql --version
# Expected: PostgreSQL 14.x or higher

# If not installed:
# macOS: brew install postgresql
# Windows: https://www.postgresql.org/download/
# Linux: sudo apt install postgresql postgresql-contrib

# Start PostgreSQL (macOS):
brew services start postgresql

# Start PostgreSQL (Linux):
sudo service postgresql start
```

#### Option B: PostgreSQL via Docker (Recommended)

```bash
docker --version
docker-compose --version

# If not installed: https://www.docker.com/products/docker-desktop
```

### Git

```bash
git --version
# Expected: git version 2.x or higher
```

---

## Clone & Navigate

```bash
# Navigate to your projects directory
cd ~/projects  # or similar

# If the project doesn't exist yet, clone it
git clone <repo-url> "Mini Arcade Royale"

# Navigate into project
cd "Mini Arcade Royale"

# Verify directory structure
ls -la
# You should see: frontend/, backend/, database/, templates/, etc.
```

---

## Backend Setup

### 1. Create Python Virtual Environment

```bash
cd backend

# Create venv
python -m venv venv

# Activate venv
# macOS/Linux:
source venv/bin/activate

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Windows (Command Prompt):
venv\Scripts\activate.bat

# Verify activation (prompt should show (venv))
which python  # macOS/Linux
where python  # Windows
```

### 2. Install Dependencies

```bash
# Ensure you're in backend/ with venv activated
pip install --upgrade pip

# Install project requirements
pip install -r requirements.txt
# This installs: fastapi, uvicorn, sqlalchemy, pydantic, psycopg2-binary, etc.

# Verify installation
pip list
```

### 3. Create Backend Config

```bash
# Copy template
cp config.example.py config.py

# Edit config.py if needed (usually defaults work for local dev)
# Later: set DEBUG=False, STRIPE_LIVE=True for prod
```

---

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend

# Install npm packages
npm install
# This installs: react, next, tailwind, framer-motion, etc.

# Verify installation
npm list next react
```

### 2. Create Frontend Config (if needed)

```bash
# Copy environment template (frontend uses .env.local for local dev)
# Frontend reads from backend URL via NEXT_PUBLIC_API_URL
```

---

## Database Setup

### Option A: PostgreSQL via Docker (Easiest)

```bash
# From project root
cd /path/to/Mini\ Arcade\ Royale

# Create docker-compose.yml if not present, or use existing
# Expected file: docker-compose.yml with postgres service

# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker-compose ps
# Should show: postgres (running)

# Check logs if issues
docker-compose logs postgres
```

### Option B: Local PostgreSQL

```bash
# Create database and user
# macOS/Linux:
psql -U postgres

# In psql:
CREATE ROLE arcade_dev WITH LOGIN PASSWORD 'arcade_pass';
ALTER ROLE arcade_dev CREATEDB;
CREATE DATABASE arcade_royale_dev OWNER arcade_dev;

# Verify
\du
\l

# Exit
\q
```

### Option C: Verify Connection

```bash
# Test connection
psql -U arcade_dev -d arcade_royale_dev -h localhost -p 5432
# Password: arcade_pass

# If successful, you'll see: arcade_royale_dev=>
# Exit with: \q
```

---

## Environment Configuration

### 1. Copy `.env.example`

```bash
# From project root
cp .env.example .env

# Edit .env with your local values
# Most defaults work for local development
```

### 2. Minimum `.env` for Local Dev

```env
# App
APP_NAME=Mini Arcade Royale
APP_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://arcade_dev:arcade_pass@localhost:5432/arcade_royale_dev

# Redis (optional, can skip for basic local dev)
# REDIS_URL=redis://localhost:6379/0

# Secrets (use random values, kept in .gitignore)
SESSION_SECRET=your-random-session-secret-at-least-32-chars
JWT_SECRET=your-random-jwt-secret-at-least-32-chars
CSRF_SECRET=your-random-csrf-secret-at-least-32-chars

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional for local dev, or use Resend sandbox)
RESEND_API_KEY=re_...  # Get from Resend.com
EMAIL_FROM=noreply@mini-arcade-royale.local
SUPPORT_EMAIL=support@mini-arcade-royale.local
ADMIN_EMAIL=admin@mini-arcade-royale.local

# Logging
LOG_LEVEL=DEBUG

# Security (local dev only)
SECURE_COOKIES=false
COOKIE_DOMAIN=localhost
```

### 3. Generate Random Secrets

```bash
# macOS/Linux:
python -c "import secrets; print('SESSION_SECRET=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('CSRF_SECRET=' + secrets.token_urlsafe(32))"

# Copy output into .env

# Windows PowerShell:
# Use an online generator or generate in Python
```

---

## Migrations & Seeding

### 1. Initialize Alembic (if not already done)

```bash
cd backend

# Check if migrations folder exists
ls ../migrations

# If not, initialize (usually already done):
# alembic init migrations
```

### 2. Run Migrations

```bash
cd backend

# Activate venv if not already
source venv/bin/activate

# Run all pending migrations
alembic upgrade head

# Check current revision
alembic current

# Expected output: (head)
```

### 3. Seed Development Data

```bash
# Create sample admin, users, games, store packages
python scripts/seed.py --environment=development

# Output: "✓ Seeded X records"
```

### 4. Verify Database

```bash
# Connect to database
psql -U arcade_dev -d arcade_royale_dev

# List tables
\dt

# Check users table
SELECT id, username, email, role FROM users LIMIT 5;

# Check credit wallet
SELECT user_id, balance FROM credit_wallets LIMIT 5;

# Exit
\q
```

---

## Running Services

### Option A: Run Backend & Frontend Separately (Easiest for Debugging)

#### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Expected output**:
```
Uvicorn running on http://127.0.0.1:8000
Docs available at http://127.0.0.1:8000/docs
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

**Expected output**:
```
> next dev
▲ Next.js 14.x.x
Local:        http://localhost:3000
```

### Option B: Run Both with `tmux` (Advanced)

```bash
# Install tmux (if needed)
# macOS: brew install tmux
# Linux: sudo apt install tmux

# Create session with two panes
tmux new-session -d -s arcade

# Pane 1: Backend
tmux send-keys -t arcade 'cd backend && source venv/bin/activate && uvicorn app.main:app --reload' Enter

# Pane 2: Frontend
tmux send-keys -t arcade:1 'cd frontend && npm run dev' Enter

# Attach to session
tmux attach -t arcade

# View alongside: Ctrl+B, then % (split vertically) or " (split horizontally)
# Navigate panes: Ctrl+B, then arrow keys
# Detach: Ctrl+B, then D
```

### Option C: Run Both with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## First Login

Once both services are running:

### 1. Access the App

```
http://localhost:3000
```

### 2. Sign Up

- **Email**: test-user@local.test
- **Username**: testuser
- **Password**: TempPass123!
- **Accept legal checkbox**: ✓
- Click **Sign Up**

### 3. Verify Email

- Check terminal logs (or email console)
- Copy verification link
- Paste in browser or click in email

### 4. Log In

- **Email or Username**: testuser
- **Password**: TempPass123!
- Click **Log In**

### 5. Explore

- **Dashboard**: http://localhost:3000/dashboard (current balance, recent games)
- **Store**: http://localhost:3000/store (purchase credits)
- **API Docs**: http://localhost:8000/docs (Swagger interactive API)

---

## API Testing (Optional)

### Via Bash/cURL

```bash
# Get auth token
RESPONSE=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "TempPass123!"
  }')

# Extract token (if using JWT)
TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# Get current user
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get credit balance
curl -X GET http://localhost:8000/api/credits/balance \
  -H "Authorization: Bearer $TOKEN"
```

### Via Postman/Insomnia

1. **Import**: Use `backend/api.postman_collection.json` (if available)
2. **Environment**: Set `base_url = http://localhost:8000`
3. **Auth**: Get token from login endpoint, paste in Bearer token field
4. **Test**: Use examples from context_docs/backend/API_CONTRACTS.md

### Via Swagger UI

Open: http://localhost:8000/docs

- Use "Authorize" button to get token
- Test any endpoint directly in browser

---

## Database Commands (Helpful)

```bash
# Connect to database
psql -U arcade_dev -d arcade_royale_dev

# List all tables
\dt

# Describe a table
\d users

# Show indexes
\di

# Reset database (CAREFUL: deletes all data)
DROP DATABASE IF EXISTS arcade_royale_dev;
CREATE DATABASE arcade_royale_dev OWNER arcade_dev;
# Then: alembic upgrade head && python scripts/seed.py

# Query examples
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM credit_transactions;
SELECT COUNT(*) FROM game_plays;

# Exit psql
\q
```

---

## Common Tasks

### Add New Python Package

```bash
cd backend
source venv/bin/activate

# Install package
pip install package-name

# Freeze to requirements.txt
pip freeze > requirements.txt

# Commit to git
git add requirements.txt
git commit -m "[PHASE-0] Add package-name"
```

### Add New Node Package

```bash
cd frontend

# Install package
npm install package-name

# Commit to git
git add package-lock.json package.json
git commit -m "[PHASE-0] Add package-name"
```

### Create Database Migration

```bash
cd backend
source venv/bin/activate

# Generate migration (auto-detects model changes)
alembic revision --autogenerate -m "Add user_status column"

# Review generated file in migrations/versions/

# Apply migration
alembic upgrade head
```

### Restart Backend

```bash
# Ctrl+C to stop uvicorn

# Reactivate venv if needed
source backend/venv/bin/activate

# Restart
uvicorn app.main:app --reload --port 8000
```

### Clear Cache & Rebuild

```bash
# Frontend
cd frontend
rm -rf .next node_modules
npm install
npm run dev

# Backend
cd backend
# Restart uvicorn (auto-reload handles most changes)
# For model changes: restart + run alembic upgrade head
```

---

## Troubleshooting

### Backend won't start

#### Error: "ModuleNotFoundError: No module named 'app'"

```bash
# Ensure venv is activated
source backend/venv/bin/activate

# Ensure you're running from backend directory
cd backend

# Check app/main.py exists
ls app/main.py

# Run correctly
uvicorn app.main:app --reload --port 8000
```

#### Error: "Address already in use [::]8000"

```bash
# Port 8000 is in use
# Option 1: Stop other service
lsof -i :8000  # Find process
kill -9 <PID>

# Option 2: Use different port
uvicorn app.main:app --reload --port 8001
```

#### Error: "could not connect to server"

```bash
# PostgreSQL not running
# Check status
pg_isready

# Start PostgreSQL
brew services start postgresql  # macOS
docker-compose up -d postgres   # Docker
sudo service postgresql start    # Linux

# Or verify DATABASE_URL in .env is correct
```

### Frontend won't start

#### Error: "npm: command not found"

```bash
# Node not installed or not in PATH
which node npm

# Install Node: https://nodejs.org/

# Or use nvm:
# macOS: brew install nvm
# https://github.com/nvm-sh/nvm
```

#### Error: "NEXT_PUBLIC_API_URL not set"

```bash
# Frontend needs backend URL
# Create .env.local in frontend/

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

#### Error: "Port 3000 already in use"

```bash
# Same as backend, use different port
npm run dev -- --port 3001
```

### Database migration fails

#### Error: "alembic command not found"

```bash
# Ensure backend venv activated
source backend/venv/bin/activate

# Ensure you're in backend directory
cd backend

# Run with python module
python -m alembic upgrade head
```

#### Error: "Can't locate Alembic SQLAlchemy versions table"

```bash
# Migrations not initialized
cd backend

# Initialize
alembic init migrations  # Usually already done

# Check if versions exist
ls migrations/versions/

# Upgrade to head
alembic upgrade head
```

### Email not sending

For local dev, mock email by checking terminal logs:

```bash
# Backend logs should show email payload
# Example output:
# [EMAIL] To: user@example.com
#         Subject: Verify Your Email
#         Body: Click link...
```

For real email testing, get Stripe webhook events:

```bash
stripe listen --forward-to localhost:8000/api/webhooks/stripe
stripe trigger charge.succeeded
```

### Stripe webhook not working

```bash
# Ensure stripe CLI is running
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Test webhook
stripe trigger charge.succeeded

# Check backend logs for webhook event

# If still failing, verify STRIPE_WEBHOOK_SECRET in .env
```

### Still stuck?

1. **Check context docs**: [context_docs/ops/](../context_docs/ops/)
2. **Check logs**: `tail -f /tmp/arcade_royale.log`
3. **Check GitHub issues**: (if applicable)
4. **Ask on Slack**: #development channel

---

## Next Steps

After local setup is working:

1. **Explore the app**: Sign up, log in, check dashboard
2. **Try API**: Hit endpoints via http://localhost:8000/docs
3. **Play a game**: Go to `/games/scratch-royale`, purchase credits in `/store`
4. **Read context docs**: Understand architecture at [context_docs/](../context_docs/)
5. **Start Phase 1**: Design system + component library

---

## Tips for Development

- **Hot Reload**: Both backend (uvicorn --reload) and frontend (Next.js) reload on file changes
- **Logs**: Check terminal output for errors
- **API Tests**: Use http://localhost:8000/docs (Swagger UI)
- **DB Queries**: Connect with `psql` to inspect data
- **Commits**: Use format `[PHASE][AREA] Description`
- **Breaking Changes**: Diff models before running migrations

---

## Developer Checklist

- [ ] Python 3.11+ installed and verified
- [ ] Node 18+ installed and verified
- [ ] PostgreSQL running (locally or Docker)
- [ ] Project cloned and navigated
- [ ] Backend venv created and activated
- [ ] Backend dependencies installed
- [ ] Frontend npm dependencies installed
- [ ] `.env` file copied and configured
- [ ] Database migrations ran (`alembic upgrade head`)
- [ ] Development data seeded (`python scripts/seed.py`)
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can sign up and log in
- [ ] Can access API docs at http://localhost:8000/docs
- [ ] Ready to start Phase 1

---

**Questions?** Open an issue or check [context_docs/](../context_docs/).

**Happy coding!** 🚀
