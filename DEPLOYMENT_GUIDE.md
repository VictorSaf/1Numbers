# 1Numbers: Deployment & Operations Guide
## Complete Production Setup, Management, and Troubleshooting

**Version**: 5.0  
**Last Updated**: January 13, 2026  
**Target Audience**: DevOps Engineers, System Administrators, Deployment Specialists

---

## TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Development Environment Setup](#development-environment-setup)
4. [Production Deployment](#production-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Configuration Management](#configuration-management)
7. [Database Management](#database-management)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling & Performance](#scaling--performance)
10. [Disaster Recovery](#disaster-recovery)
11. [Troubleshooting](#troubleshooting)
12. [Security Hardening](#security-hardening)

---

## QUICK START

### 30-Minute Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/VictorSaf/1Numbers.git
cd 1Numbers

# 2. Create environment file
cp .env.example .env
# Edit .env with local settings

# 3. Start all services
docker-compose up -d

# 4. Wait for services to be healthy
docker-compose ps
# Output should show all containers as "Up"

# 5. Run database migrations
docker-compose exec backend python -m alembic upgrade head

# 6. Seed initial data (optional)
docker-compose exec backend python scripts/seed_data.py

# 7. Access application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Adminer: http://localhost:8080
```

### Environment Variables Template

```bash
# .env
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
DATABASE_POOL_SIZE=10
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_TTL=3600

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
API_RELOAD=true

# JWT
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_MODEL=gpt-4
OPENAI_TIMEOUT=30

# MCP Servers
MCP_RESEARCH_URL=http://mcp-research:5000
MCP_RESEARCH_TIMEOUT=30

# Weaviate
WEAVIATE_URL=http://weaviate:8080
WEAVIATE_TIMEOUT=30

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

---

## PREREQUISITES

### System Requirements

**Minimum (Development)**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 20 GB SSD
- OS: macOS, Linux, or Windows (WSL2)

**Recommended (Production)**
- CPU: 16+ cores
- RAM: 32 GB+
- Storage: 100+ GB SSD
- OS: Ubuntu 20.04 LTS or CentOS 8+
- Network: 1Gbps+ connection

### Software Requirements

```bash
# Version requirements (check with --version)
Docker           >= 20.10
Docker Compose   >= 2.0
Python           >= 3.11
Node.js          >= 18.0
PostgreSQL       >= 15.0
Redis            >= 7.0
Kubernetes       >= 1.24 (optional, for enterprise)
```

### Installation

```bash
# macOS
brew install docker docker-compose python@3.11 node postgresql redis

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-compose python3.11 nodejs postgresql redis-server

# Verify installations
docker --version
docker-compose --version
python3.11 --version
node --version
```

---

## DEVELOPMENT ENVIRONMENT SETUP

### Project Structure

```
1Numbers/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py          # API endpoints
│   │   │   └── dependencies.py
│   │   ├── models/
│   │   │   └── __init__.py        # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── __init__.py        # Pydantic schemas
│   │   ├── services/
│   │   │   ├── numerology.py
│   │   │   ├── ai_engine.py
│   │   │   ├── ml_engine.py
│   │   │   └── research_agent.py
│   │   ├── mcp/
│   │   │   ├── client_manager.py
│   │   │   └── tools.py
│   │   └── utils/
│   │       ├── cache.py
│   │       ├── logging.py
│   │       └── security.py
│   ├── migrations/                # Alembic migrations
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/                 # Redux store
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── mobile/                        # React Native
│   ├── src/
│   ├── app.json
│   ├── package.json
│   └── Dockerfile
│
├── mcp_servers/                   # MCP server implementations
│   ├── research/
│   │   └── server.py
│   └── docker-compose.yml
│
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production compose
├── kubernetes/                    # K8s manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-statefulset.yaml
│   ├── redis-statefulset.yaml
│   ├── service.yaml
│   └── ingress.yaml
│
├── scripts/
│   ├── deploy.sh                  # Deployment automation
│   ├── migrate.sh                 # Database migrations
│   ├── backup.sh                  # Backup procedures
│   ├── rollback.sh                # Rollback procedures
│   └── health_check.sh            # Health verification
│
├── ARCHITECTURE.md
├── DEPLOYMENT_GUIDE.md            # This file
├── README.md
└── .github/
    └── workflows/
        ├── ci.yml                 # GitHub Actions CI
        └── deployment.yml         # GitHub Actions CD
```

### Setup Backend Development

```bash
# Navigate to backend
cd backend

# Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt

# Create .env file
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Setup Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# In browser: http://localhost:5173
```

### Setup MCP Research Server

```bash
# Navigate to MCP server
cd mcp_servers/research

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
# Server runs on http://localhost:5000
```

---

## PRODUCTION DEPLOYMENT

### Pre-Deployment Checklist

```bash
#!/bin/bash
# scripts/pre_deployment_checklist.sh

echo "🔍 Pre-Deployment Checklist"
echo "=============================="

# 1. Code quality
echo "✓ Running linting..."
cd backend && flake8 app/ && cd ..
echo "✓ Running type checking..."
cd backend && mypy app/ && cd ..

# 2. Testing
echo "✓ Running unit tests..."
cd backend && pytest tests/unit -v && cd ..
echo "✓ Running integration tests..."
cd backend && pytest tests/integration -v && cd ..
echo "✓ Running E2E tests..."
cd frontend && npm run test:e2e && cd ..

# 3. Security scanning
echo "✓ Scanning for vulnerabilities..."
cd backend && pip install safety && safety check && cd ..
npm audit --production

# 4. Docker build
echo "✓ Building Docker images..."
docker-compose build

# 5. Documentation
echo "✓ Verifying documentation..."
ls -la ARCHITECTURE.md DEPLOYMENT_GUIDE.md

echo "✅ Pre-deployment checklist complete!"
```

### Docker Image Building

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Build with custom registry
docker build -t registry.example.com/1numbers/backend:v5.0 -f backend/Dockerfile backend/

# Tag images
docker tag 1numbers-backend:latest registry.example.com/1numbers/backend:v5.0
docker tag 1numbers-frontend:latest registry.example.com/1numbers/frontend:v5.0

# Push to registry
docker push registry.example.com/1numbers/backend:v5.0
docker push registry.example.com/1numbers/frontend:v5.0
```

### Docker Compose Production Deployment

```bash
#!/bin/bash
# scripts/deploy.sh

set -e  # Exit on error

ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

echo "🚀 Deploying 1Numbers v$VERSION to $ENVIRONMENT"

# 1. Backup current state
echo "📦 Creating backup..."
./scripts/backup.sh

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Build images
echo "🏗️  Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# 4. Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend \
  python -m alembic upgrade head

# 5. Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Wait for services
echo "⏳ Waiting for services to be healthy..."
sleep 10

# 7. Health checks
echo "🔍 Running health checks..."
./scripts/health_check.sh

# 8. Smoke tests
echo "✅ Running smoke tests..."
./scripts/smoke_tests.sh

echo "✅ Deployment complete!"
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Nginx load balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend (3 replicas)
  backend-1:
    image: registry.example.com/1numbers/backend:v5.0
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
      - REDIS_URL=redis://redis-master:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - MCP_RESEARCH_URL=http://mcp-research:5000
    depends_on:
      - postgres
      - redis-master
      - mcp-research
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend-2:
    image: registry.example.com/1numbers/backend:v5.0
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
      - REDIS_URL=redis://redis-master:6379/0
    depends_on:
      - postgres
      - redis-master
    restart: always

  backend-3:
    image: registry.example.com/1numbers/backend:v5.0
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
      - REDIS_URL=redis://redis-master:6379/0
    depends_on:
      - postgres
      - redis-master
    restart: always

  # PostgreSQL primary
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=numbers_db
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis master (with persistence)
  redis-master:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MCP Research server
  mcp-research:
    image: registry.example.com/1numbers/mcp-research:v5.0
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
    depends_on:
      - postgres
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Prometheus monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: always

  # Grafana visualization
  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    restart: always

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

---

## KUBERNETES DEPLOYMENT

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install helm (optional but recommended)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Set up kubeconfig
export KUBECONFIG=~/.kube/config
kubectl cluster-info
```

### Create Kubernetes Namespace

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: 1numbers-prod
  labels:
    environment: production
```

### Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl create namespace 1numbers-prod

# 2. Create secrets
kubectl create secret generic 1numbers-secrets \
  --from-literal=db-password=$DB_PASSWORD \
  --from-literal=redis-password=$REDIS_PASSWORD \
  --from-literal=jwt-secret=$JWT_SECRET_KEY \
  --from-literal=openai-key=$OPENAI_API_KEY \
  -n 1numbers-prod

# 3. Create ConfigMap
kubectl create configmap 1numbers-config \
  --from-literal=environment=production \
  --from-literal=db-host=postgres \
  --from-literal=redis-host=redis \
  -n 1numbers-prod

# 4. Apply manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/postgres-statefulset.yaml
kubectl apply -f kubernetes/redis-statefulset.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml

# 5. Verify deployment
kubectl get pods -n 1numbers-prod
kubectl get services -n 1numbers-prod

# 6. Check logs
kubectl logs -f deployment/backend -n 1numbers-prod
```

### Sample K8s Backend Deployment

```yaml
# kubernetes/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: 1numbers-prod
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
    spec:
      containers:
      - name: backend
        image: registry.example.com/1numbers/backend:v5.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: ENVIRONMENT
          valueFrom:
            configMapKeyRef:
              name: 1numbers-config
              key: environment
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: 1numbers-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: 1numbers-secrets
              key: redis-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: 1numbers-secrets
              key: openai-key
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: 1numbers-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - backend
              topologyKey: kubernetes.io/hostname
```

---

## CONFIGURATION MANAGEMENT

### Environment Configuration

```python
# backend/app/config.py
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "10"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_CACHE_TTL: int = int(os.getenv("REDIS_CACHE_TTL", "3600"))
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_WORKERS: int = int(os.getenv("API_WORKERS", "4"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    
    # MCP
    MCP_RESEARCH_URL: str = os.getenv("MCP_RESEARCH_URL", "http://localhost:5000")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### Secrets Management

```bash
# Using Docker secrets (Swarm)
echo "super-secret-key" | docker secret create jwt_secret -

# Using Kubernetes secrets
kubectl create secret generic 1numbers-secrets \
  --from-literal=jwt-secret-key=your-secret-key \
  -n 1numbers-prod

# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name 1numbers/prod/jwt-secret \
  --secret-string "your-secret-key"

# Using HashiCorp Vault
vault write secret/1numbers/prod \
  jwt_secret_key="your-secret-key" \
  openai_api_key="sk-xxxxx"
```

---

## DATABASE MANAGEMENT

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic current
alembic history

# Check pending migrations
alembic upgrade --sql head
```

### Backup & Restore

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

echo "📦 Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U user numbers_db | gzip > $BACKUP_FILE

echo "📦 Backing up Redis data..."
docker-compose exec -T redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

echo "✅ Backup complete: $BACKUP_FILE"
```

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <backup-file>"
  exit 1
fi

echo "🔄 Restoring database from $BACKUP_FILE..."
gunzip < $BACKUP_FILE | docker-compose exec -T postgres psql -U user numbers_db

echo "✅ Restore complete!"
```

### Database Performance Tuning

```sql
-- Create indexes for common queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_research_results_status ON research_results(status);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_id = 1;

-- Vacuum and analyze tables
VACUUM ANALYZE profiles;
VACUUM ANALYZE calculations;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## MONITORING & LOGGING

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

### Application Logging

```python
# backend/app/utils/logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add JSON formatter
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger()
logger.addHandler(handler)
```

### Alert Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High API response time"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "PostgreSQL database is down"

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        annotations:
          summary: "Redis cache is down"
```

---

## SCALING & PERFORMANCE

### Horizontal Scaling

```bash
# Scale backend replicas
docker-compose up -d --scale backend=5

# Kubernetes scaling
kubectl scale deployment backend --replicas=5 -n 1numbers-prod

# Check current replicas
kubectl get deployment backend -n 1numbers-prod
```

### Database Connection Pooling

```python
# backend/app/db.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

DATABASE_URL = "postgresql://user:password@postgres:5432/numbers_db"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # Connections to keep in pool
    max_overflow=40,           # Additional connections
    pool_pre_ping=True,        # Test connections before use
    pool_recycle=3600,         # Recycle connections hourly
    echo=False,
    connect_args={
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
    }
)
```

### Redis Cache Optimization

```python
# backend/app/utils/cache.py
import redis
from typing import Any, Optional
import json

class RedisCache:
    def __init__(self, url: str):
        self.redis = redis.from_url(url, decode_responses=True)
    
    async def get(self, key: str) -> Optional[Any]:
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        self.redis.setex(key, ttl, json.dumps(value))
    
    async def delete(self, key: str):
        self.redis.delete(key)
    
    async def flush_all(self):
        self.redis.flushall()
    
    # Cache warming
    async def warm_cache(self, keys: list[str]):
        """Pre-populate cache with frequently accessed data"""
        pipeline = self.redis.pipeline()
        for key in keys:
            data = self._fetch_from_db(key)
            pipeline.setex(key, 3600, json.dumps(data))
        pipeline.execute()
```

### Performance Benchmarking

```bash
#!/bin/bash
# scripts/benchmark.sh

echo "🏃 Running performance benchmarks..."

# API endpoint performance
echo "Testing API endpoints..."
ab -n 1000 -c 10 http://localhost:8000/health

# Database query performance
echo "Testing database queries..."
docker-compose exec backend python -m pytest tests/performance -v

# Load testing
echo "Running load test..."
locust -f loadtest.py --host http://localhost:8000 --users 1000 --spawn-rate 50
```

---

## DISASTER RECOVERY

### Backup Strategy

- **Frequency**: Every 6 hours
- **Retention**: 30 days of backups
- **Location**: Cloud storage (S3/GCS)
- **Testing**: Weekly restore drills

```bash
#!/bin/bash
# scripts/backup_to_s3.sh

BACKUP_DIR="./backups"
S3_BUCKET="1numbers-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create local backup
./scripts/backup.sh

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://$S3_BUCKET/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Rollback Procedure

```bash
#!/bin/bash
# scripts/rollback.sh

VERSION=${1:-previous}

echo "🔙 Rolling back to $VERSION..."

# Checkout previous version
git checkout $VERSION

# Rebuild images
docker-compose build

# Restore database from backup
./scripts/restore.sh ./backups/backup_$(date -d "1 day ago" +%Y%m%d)_latest.sql.gz

# Restart services
docker-compose up -d

# Verify rollback
./scripts/health_check.sh

echo "✅ Rollback complete!"
```

### High Availability Setup

```yaml
# docker-compose.prod.yml (excerpt)
services:
  postgres-primary:
    # Primary database
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=master
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data

  postgres-replica:
    # Replica for read scaling
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=slave
      - PGUSER=replicator
    depends_on:
      - postgres-primary
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
```

---

## TROUBLESHOOTING

### Common Issues

**Issue: Services won't start**

```bash
# Check Docker daemon
docker ps

# Check logs
docker-compose logs -f service-name

# Check network
docker network ls

# Restart Docker
sudo systemctl restart docker
```

**Issue: Database connection errors**

```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U user -c "SELECT 1"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Reset connections
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

**Issue: High memory usage**

```bash
# Check container memory
docker stats

# Check Python memory
docker-compose exec backend ps aux | grep python

# Profile memory usage
docker-compose exec backend python -m memory_profiler app.py
```

**Issue: Slow API responses**

```bash
# Check slow queries
docker-compose exec postgres psql -U user -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Monitor Redis
docker-compose exec redis redis-cli INFO stats

# Check system resources
docker stats
top
```

### Health Check Commands

```bash
#!/bin/bash
# scripts/health_check.sh

echo "🔍 Running health checks..."

# API health
curl -s http://localhost:8000/health | jq .

# Database health
docker-compose exec -T postgres pg_isready -U user

# Redis health
docker-compose exec -T redis redis-cli ping

# Frontend health
curl -s http://localhost:3000 | head -20

# MCP Server health
curl -s http://localhost:5000/health | jq .

echo "✅ Health checks complete!"
```

---

## SECURITY HARDENING

### Network Security

```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Configure SSL/TLS
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt

# Enable CORS properly (in FastAPI)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Secrets Rotation

```bash
#!/bin/bash
# scripts/rotate_secrets.sh

# Generate new JWT secret
NEW_JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")

# Update in Kubernetes
kubectl patch secret 1numbers-secrets \
  -p="{\"data\":{\"jwt-secret-key\":\"$(echo -n $NEW_JWT_SECRET | base64)\"}}" \
  -n 1numbers-prod

# Restart pods to pick up new secret
kubectl rollout restart deployment/backend -n 1numbers-prod

echo "✅ Secrets rotated!"
```

### Compliance & Auditing

```python
# backend/app/middleware/audit.py
import logging
from fastapi import Request

audit_logger = logging.getLogger("audit")

async def audit_middleware(request: Request, call_next):
    """Log all API requests for audit trails"""
    
    response = await call_next(request)
    
    audit_logger.info({
        'timestamp': datetime.utcnow().isoformat(),
        'method': request.method,
        'path': request.url.path,
        'status_code': response.status_code,
        'user_id': request.state.user_id if hasattr(request.state, 'user_id') else None,
        'ip_address': request.client.host,
    })
    
    return response
```

---

## APPENDICES

### Useful Commands Reference

```bash
# Docker
docker-compose up -d               # Start services
docker-compose down                # Stop services
docker-compose logs -f             # View logs
docker-compose ps                  # List services
docker exec -it container bash     # Access container

# Kubernetes
kubectl apply -f manifest.yaml     # Deploy
kubectl get pods                   # List pods
kubectl logs pod-name              # View logs
kubectl describe pod pod-name       # Get details
kubectl delete pod pod-name        # Delete pod

# Database
psql -U user -d numbers_db         # Connect to PostgreSQL
redis-cli                          # Connect to Redis
\du                                # List users (psql)
\l                                 # List databases (psql)

# Git
git tag v5.0                       # Create version tag
git push origin v5.0               # Push tag
git log --oneline                  # View commit history
```

---

**Questions?** Refer to ARCHITECTURE.md or check logs for detailed errors.

**Emergency Contact**: On-call DevOps team - See runbook for escalation path.

**Last Updated**: January 13, 2026
