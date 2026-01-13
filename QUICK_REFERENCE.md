# 1Numbers: Quick Reference Card
## Essential Commands, Endpoints & Troubleshooting

**Last Updated**: January 13, 2026 | **Version**: 5.0

---

## 🚀 QUICK START (30 Minutes)

```bash
# 1. Clone & navigate
git clone https://github.com/VictorSaf/1Numbers.git && cd 1Numbers

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Start everything
docker-compose up -d

# 4. Run migrations
docker-compose exec backend python -m alembic upgrade head

# 5. Access app
# Frontend: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

---

## 📡 ESSENTIAL ENDPOINTS (Most Used)

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Get token from response, then use:
TOKEN="your-jwt-token"
echo $TOKEN
```

### Core Numerology
```bash
# Full profile calculation
curl -X POST http://localhost:8000/numerology/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "birth_date":"1990-05-15",
    "system":"pythagorean"
  }'

# Life path only (no auth needed)
curl -X POST http://localhost:8000/numerology/life-path \
  -H "Content-Type: application/json" \
  -d '{"birth_date":"1990-05-15"}'

# Personal year
curl http://localhost:8000/numerology/personal-year \
  -d "birth_date=1990-05-15&year=2026"
```

### Profiles & Data
```bash
# Create profile
curl -X POST http://localhost:8000/profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","birth_date":"1990-05-15"}'

# List profiles
curl http://localhost:8000/profiles?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"

# Compatibility
curl -X POST http://localhost:8000/compatibility/compare \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile1_id":"id1","profile2_id":"id2"}'
```

### AI & Insights
```bash
# AI Interpretation
curl -X POST http://localhost:8000/ai/interpret \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profile_id":"id","focus":"life_path"}'

# Get recommendations
curl http://localhost:8000/recommendations?profile_id=id&limit=5 \
  -H "Authorization: Bearer $TOKEN"
```

### Research & MCP
```bash
# List MCP tools
curl http://localhost:8000/mcp/tools \
  -H "Authorization: Bearer $TOKEN"

# Call MCP tool
curl -X POST http://localhost:8000/mcp/tool-call \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name":"search_numerology_knowledge",
    "arguments":{"query":"life path 7","source":"classical"}
  }'

# Trigger research discovery
curl -X POST http://localhost:8000/research/discover-utilities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"cycles","search_depth":"medium"}'
```

---

## 🐳 DOCKER COMMANDS

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend          # Backend logs
docker-compose logs -f postgres          # Database logs
docker-compose logs -f redis             # Cache logs

# Access shell
docker-compose exec backend bash         # Backend container
docker-compose exec postgres psql -U user numbers_db  # PostgreSQL
docker-compose exec redis redis-cli     # Redis CLI

# Restart service
docker-compose restart backend

# Scale service
docker-compose up -d --scale backend=3

# Clean up
docker-compose down -v                  # Remove volumes too
docker system prune                     # Clean all unused
```

---

## 🗄️ DATABASE COMMANDS

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U user -d numbers_db

# Run migrations
alembic upgrade head              # Apply all
alembic upgrade +1                # Apply 1 migration
alembic downgrade -1              # Rollback 1
alembic current                   # Current version
alembic history                   # Migration history

# Create migration
alembic revision --autogenerate -m "Description"

# Database backup
docker-compose exec -T postgres pg_dump -U user numbers_db | gzip > backup.sql.gz

# Database restore
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U user numbers_db

# Useful queries
SELECT COUNT(*) FROM profiles;                    # Count profiles
SELECT * FROM pg_stat_activity;                  # Active connections
VACUUM ANALYZE profiles;                         # Optimize table
CREATE INDEX idx_profiles_user ON profiles(user_id);  # Create index
```

---

## ⚙️ CONFIGURATION

### Key Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/numbers_db
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_TTL=3600

# API
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24
OPENAI_API_KEY=sk-xxxx

# Servers
MCP_RESEARCH_URL=http://mcp-research:5000
WEAVIATE_URL=http://weaviate:8080

# Development
DEBUG=true
ENVIRONMENT=development
```

### Update Config

```bash
# Edit .env
nano .env

# Reload config in running containers
docker-compose exec backend kill -HUP 1

# Or restart
docker-compose restart backend
```

---

## 📊 MONITORING & HEALTH CHECKS

```bash
# Health check endpoints
curl http://localhost:8000/health                    # API health
curl http://localhost:3000                           # Frontend
curl http://localhost:5000/health                    # MCP server

# View metrics
curl http://localhost:9090                           # Prometheus
curl http://localhost:3001                           # Grafana

# Docker stats
docker stats

# Check resource usage
top                    # System
df -h                  # Disk space
free -h                # Memory

# Logs
journalctl -u docker --follow     # Docker logs
sudo tail -f /var/log/syslog       # System logs
```

---

## 🔧 TROUBLESHOOTING QUICK FIXES

### Services won't start
```bash
# Check if ports are in use
lsof -i :8000                    # Port 8000
lsof -i :3000                    # Port 3000
lsof -i :5432                    # Port 5432

# Kill process using port
kill -9 $(lsof -t -i :8000)

# Restart Docker
sudo systemctl restart docker
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres pg_isready -U user

# View connection pool
docker-compose exec postgres psql -U user -c "SELECT * FROM pg_stat_activity;"

# Reset connections
docker-compose exec postgres psql -U user -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'numbers_db';"
```

### High memory usage
```bash
# Check container memory
docker stats

# View process memory
docker-compose exec backend ps aux | grep python

# Increase container memory
# Edit docker-compose.yml:
# services:
#   backend:
#     mem_limit: 2g
```

### Slow API responses
```bash
# Check slow queries
docker-compose exec postgres psql -U user -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;"

# Check cache hit rate
docker-compose exec redis redis-cli INFO stats

# View response times
curl -w "Time: %{time_total}s\n" http://localhost:8000/health
```

### Can't login / auth issues
```bash
# Check JWT secret is set
echo $JWT_SECRET_KEY

# Verify token is valid
# Decode at https://jwt.io

# Reset user password
docker-compose exec backend python -c "
from app.security import get_password_hash
from app.models import User
from app.db import SessionLocal
db = SessionLocal()
user = db.query(User).filter(User.email=='user@example.com').first()
if user:
    user.hashed_password = get_password_hash('newpassword')
    db.commit()
    print('Password reset')
"
```

---

## 📈 PERFORMANCE TUNING

```bash
# View slow queries (PostgreSQL)
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

# Analyze query plan
EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_id = 1;

# Create missing indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_calculations_created_at ON calculations(created_at);

# Redis memory info
docker-compose exec redis redis-cli INFO memory

# Redis cache warmth
docker-compose exec redis redis-cli INFO stats

# Increase pool size (docker-compose.yml)
# DATABASE_POOL_SIZE=30
# DATABASE_MAX_OVERFLOW=50
```

---

## 🚀 DEPLOYMENT

### Production Deployment
```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Create secrets
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec backend \
  python -m alembic upgrade head

# 5. Verify
docker-compose -f docker-compose.prod.yml ps
curl -s http://localhost/health | jq .
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace 1numbers-prod

# Create secrets
kubectl create secret generic 1numbers-secrets \
  --from-literal=jwt-secret-key=your-secret \
  -n 1numbers-prod

# Deploy
kubectl apply -f kubernetes/

# Check status
kubectl get pods -n 1numbers-prod
kubectl logs -f deployment/backend -n 1numbers-prod

# Scale
kubectl scale deployment backend --replicas=5 -n 1numbers-prod
```

---

## 📚 TESTING

```bash
# Backend tests
cd backend
pytest tests/unit -v                    # Unit tests
pytest tests/integration -v             # Integration tests
pytest tests/performance -v             # Performance tests
pytest --cov=app --cov-report=html     # Coverage report

# Frontend tests
cd frontend
npm test                                 # Jest unit tests
npm run test:e2e                        # Cypress E2E tests
npm run test:coverage                   # Coverage report

# API testing
curl -X GET http://localhost:8000/docs  # Swagger UI
curl -X GET http://localhost:8000/redoc # ReDoc
```

---

## 🔐 SECURITY CHECKLIST

```bash
# ✅ Before going to production

# 1. Change default credentials
echo "Remember to change all default passwords!"

# 2. Generate strong JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 3. Enable HTTPS
# Update nginx.conf with SSL certificate

# 4. Set environment to production
export ENVIRONMENT=production
export DEBUG=false

# 5. Scan for vulnerabilities
pip install safety && safety check          # Python
npm audit                                   # Node.js

# 6. Run security tests
pytest tests/security -v

# 7. Check file permissions
chmod 600 .env                              # .env should be read-only
chmod 700 scripts/                          # Scripts executable

# 8. Backup database
./scripts/backup.sh
```

---

## 📞 GETTING HELP

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :PORT` and `kill -9 PID` |
| Docker won't start | `docker system prune -a` and restart |
| Database locked | `SELECT pg_terminate_backend(pid) FROM pg_stat_activity` |
| Out of memory | Increase `mem_limit` in docker-compose.yml |
| Slow queries | Check indexes: `EXPLAIN ANALYZE ...` |
| Auth failing | Verify JWT_SECRET_KEY is set |
| Cache not working | Check Redis: `docker-compose exec redis redis-cli PING` |
| API docs missing | Access `/docs` (Swagger) or `/redoc` (ReDoc) |

---

## 📋 USEFUL LINKS

- **Local API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Database Admin**: `docker-compose exec postgres psql`
- **Redis CLI**: `docker-compose exec redis redis-cli`
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

---

## 🔄 COMMON WORKFLOWS

### Add New Feature
```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# Edit files...

# 3. Run tests
pytest tests/
npm test

# 4. Commit and push
git add .
git commit -m "Add feature"
git push origin feature/your-feature

# 5. Create pull request
# Go to GitHub and create PR
```

### Deploy to Production
```bash
# 1. Create backup
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Build and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec backend \
  python -m alembic upgrade head

# 5. Verify
curl -s http://your-domain/health | jq .

# 6. Monitor
tail -f logs/app.log
```

### Rollback Deployment
```bash
# 1. Restore database from backup
./scripts/restore.sh ./backups/backup_latest.sql.gz

# 2. Checkout previous version
git checkout previous-tag

# 3. Rebuild and restart
docker-compose build
docker-compose up -d

# 4. Verify rollback
curl -s http://localhost/health | jq .
```

---

## 📅 MAINTENANCE SCHEDULE

```
Daily:
  - Check error logs
  - Verify system health
  - Monitor disk space

Weekly:
  - Review slow queries
  - Check security updates
  - Test backup/restore

Monthly:
  - Full database optimization
  - Performance analysis
  - Capacity planning review
  - Security audit

Quarterly:
  - Load testing
  - Disaster recovery drill
  - Dependency updates
```

---

**Print this page for your desk!**

**Questions?** Check DEPLOYMENT_GUIDE.md or API_REFERENCE.md

**Last Updated**: January 13, 2026 | **Version**: 5.0
