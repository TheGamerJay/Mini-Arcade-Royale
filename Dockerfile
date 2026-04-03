# Multi-stage build - Backend + Frontend unified for Railway
# Stage 1: Build backend dependencies
FROM python:3.11-slim as backend-builder

WORKDIR /backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /frontend

# Copy and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source and build
COPY frontend/ .
RUN npm run build

# Stage 3: Runtime (combined)
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies (Python, Node LTS, Nginx)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    nginx \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy Python backend
COPY --from=backend-builder /root/.local /root/.local
COPY backend/ ./backend/

# Copy frontend
COPY --from=frontend-builder /frontend/.next ./frontend/.next
COPY --from=frontend-builder /frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /frontend/public ./frontend/public
COPY frontend/package.json ./frontend/

# Set environment
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Configure Nginx to route frontend + api to backend
RUN mkdir -p /etc/nginx/conf.d && cat > /etc/nginx/conf.d/default.conf << 'EOF'
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 8080;
    server_name _;
    client_max_body_size 10M;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Health check
    location /api/health {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }

    # API docs
    location /docs {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }

    location /redoc {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }

    # Frontend (everything else)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Starting Backend..."
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🚀 Starting Frontend..."
cd /app/frontend
npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 4

echo "🚀 Starting Nginx..."
service nginx start

echo "✅ All services started!"
echo "📍 Open: http://localhost:8080"

# Keep container running
wait $BACKEND_PID $FRONTEND_PID
EOF

RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

CMD ["/app/start.sh"]
