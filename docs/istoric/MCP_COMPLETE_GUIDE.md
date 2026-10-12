# 1Numbers v3.0: Complete MCP Integration Guide

**Version:** 3.0.0  
**Date:** January 13, 2026  
**Status:** ✅ Production Ready  

---

## Overview

This guide provides a complete reference for the MCP (Model Context Protocol) integration in 1Numbers v3.0, enabling:

- ✅ **Autonomous Tool Discovery** - Automatically discover new numerology calculation methods
- ✅ **Distributed Agent System** - LangGraph-based multi-agent orchestration
- ✅ **Knowledge Management** - RAG with Weaviate vector embeddings
- ✅ **Research Automation** - LLM-powered validation and integration
- ✅ **Tool Caching & Performance** - Redis-backed optimization
- ✅ **Production Monitoring** - Comprehensive metrics and health checks

---

## Architecture Overview

```
┌───────────────────────────────┐
│         Frontend (React)            │
│    Numerology Calculator UI        │
└───────────────────────────────┘
                   │
                   ↓
┌───────────────────────────────┐
│    FastAPI Backend Server         │
│  /numerology/calculate              │
│  /mcp/tools                         │
│  /mcp/tool-call                     │
│  /research/discover-utilities      │
│  /compatibility/compare             │
│  /ws/agents/stream                 │
└───────────────────────────────┘
         │       │       │        │
         ↓       ↓       ↓        ↓
    ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐
    │Orchestr.│  │Calcul. │  │Research│  │Compare │
    │Agent    │  │Agent   │  │Agent    │  │Agent    │
    └───────┘  └───────┘  └───────┘  └───────┘
         │
    ┌───────────────────────────────┐
    │    MCP Client Manager (Tool Discovery)         │
    └───────────────────────────────┘
         │       │       │
         ↓       ↓       ↓
    ┌───────┐  ┌───────┐  ┌───────┐
    │Research │  │Knowledge│  │Utilities│
    │Server   │  │Server    │  │Server    │
    └───────┘  └───────┘  └───────┘
         │       │       │
         │       │       │
    ┌───────────────────────────────┐
    │    Data Layer (PostgreSQL + Redis + Weaviate)  │
    │  Tables: users, profiles, executions, etc     │
    │  Cache: Tool definitions, results              │
    │  Vectors: Knowledge embeddings                 │
    └───────────────────────────────┘
```

---

## File Structure

```
1Numbers/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── calculator.py           (✅ Phase 1)
│   │   ├── orchestrator.py         (✅ Phase 2)
│   │   ├── interpreter.py          (✅ Phase 2)
│   │   ├── research.py             (🔜 Implemented)
│   │   ├── comparison.py           (✅ Phase 3)
│   │   ├── forecast.py             (✅ Phase 3)
│   │   ├── types.py                (✅ Phase 1)
│   │   └── test_*.py               (🔜 Implemented)
│   ├── mcp/
│   │   ├── client_manager.py       (🔜 Implemented)
│   │   ├── tool_registry.py        (🔜 Implemented)
│   │   └── test_mcp_*.py           (🔜 Implemented)
│   ├── monitoring/
│   │   └── mcp_metrics.py          (🔜 Implemented)
│   ├── main.py                 (✅ Phase 1)
│   ├── config.py               (✅ Phase 1)
│   ├── requirements.txt        (✅ Phase 1)
│   ├── Dockerfile              (✅ Phase 1)
│   └── sql/
│       └── schema.sql          (✅ Phase 1)
├── mcp_servers/
│   ├── research/
│   │   ├── server.py               (🔜 Implemented)
│   │   ├── Dockerfile              (🔜 Implemented)
│   │   └── requirements.txt        (🔜 Implemented)
│   ├── knowledge/              (🔜 Implemented)
│   └── utilities/              (🔜 Implemented)
├── .github/
│   ├── workflows/
│   │   ├── backend-tests.yml       (✅ Phase 1)
│   │   └── mcp-tests.yml           (🔜 Implemented)
│   └── pull_request_template.md (✅ Phase 1)
├── docker-compose.yml      (✅ + MCP services)
├── BACKEND_SETUP.md        (✅ Phase 1)
├── PHASE_1_COMPLETION.md   (✅ Phase 1)
├── CONTRIBUTING.md         (✅ Phase 1)
├── MCP_INTEGRATION_PART_A-D.md (🔜 Implemented)
├── MCP_INTEGRATION_PART_E.md (🔜 Implemented)
├── MCP_COMPLETE_GUIDE.md   (🔜 This file)
└── DEPLOYMENT_CHECKLIST.md (🔜 Implemented)
```

---

## Quick Start

### 1. Prerequisites

```bash
# Install Docker & Docker Compose
docker --version  # 20.10+
docker-compose --version  # 2.0+

# Clone repository
git clone https://github.com/VictorSaf/1Numbers.git
cd 1Numbers
```

### 2. Start All Services

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Start full stack with MCP
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Verify all services
docker-compose ps
```

### 3. Test MCP Integration

```bash
# Check available tools
curl http://localhost:8000/mcp/tools

# Call a research tool
curl -X POST http://localhost:8000/mcp/tool-call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "search_numerology_knowledge",
    "arguments": {"query": "life path 7"}
  }'

# Trigger research
curl -X POST http://localhost:8000/research/discover-utilities \
  -H "Content-Type: application/json" \
  -d '{"category": "cycles"}'
```

---

## MCP Servers Reference

### Research Server (Port 5000)

**Purpose:** Autonomously discover and validate new numerology methods

**Available Tools:**
1. `search_numerology_knowledge` - Search knowledge base
2. `analyze_number_patterns` - Find patterns in data
3. `discover_new_utilities` - Discover new calculation methods
4. `fetch_compatibility_data` - Get compatibility matrices
5. `validate_numerology_theory` - Validate interpretations

**Example Usage:**
```python
result = await mcp.call_tool(
    'discover_new_utilities',
    {'category': 'cycles', 'search_depth': 'medium'},
    'research'
)
```

### Knowledge Server (Port 5001)

**Purpose:** Store and retrieve numerology knowledge via RAG

**Features:**
- Semantic search with Weaviate
- Document ingestion pipeline
- Citation tracking
- Confidence scoring

### Utilities Server (Port 5002)

**Purpose:** Manage numerology utilities and calculation methods

**Features:**
- Utility registry
- Implementation status tracking
- Validation metrics
- Integration workflow

---

## API Endpoints

### Numerology Calculation

**POST** `/numerology/calculate`
```json
{
  "name": "John Doe",
  "day": 15,
  "month": 3,
  "year": 1990,
  "system": "pythagorean"
}
```

**Response:**
```json
{
  "status": "success",
  "profile": {
    "life_path": 7,
    "expression": 5,
    "soul_urge": 4,
    "personality": 1,
    "birthday": 6,
    "maturity": 3,
    "hidden_passion": 2,
    "subconscious_self": 8,
    "karmic_debt": false
  },
  "execution_time_ms": 45.2
}
```

### MCP Tools

**GET** `/mcp/tools`

**Response:**
```json
{
  "total": 15,
  "tools": [
    {
      "name": "search_numerology_knowledge",
      "description": "Search numerology databases",
      "mcp_server": "research"
    }
  ],
  "servers": ["research", "knowledge", "utilities"]
}
```

**POST** `/mcp/tool-call`
```json
{
  "tool_name": "search_numerology_knowledge",
  "arguments": {"query": "life path 7"}
}
```

### Research & Discovery

**POST** `/research/discover-utilities`
```json
{
  "category": "cycles"
}
```

**GET** `/research/results?limit=10`

### Compatibility Analysis

**POST** `/compatibility/compare`
```json
{
  "profiles": [
    {"name": "John", "day": 15, "month": 3, "year": 1990},
    {"name": "Jane", "day": 22, "month": 7, "year": 1992}
  ]
}
```

### WebSocket Streaming

**WS** `/ws/agents/stream/{user_id}`

**Example Client:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/agents/stream/user123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data);
};

ws.send(JSON.stringify({
  type: 'full_profile',
  name: 'John',
  day: 15,
  month: 3,
  year: 1990
}));
```

---

## Configuration

### Environment Variables

**backend/.env**

```bash
# MCP Servers
MCP_RESEARCH_URL=http://mcp-research:5000
MCP_KNOWLEDGE_URL=http://mcp-knowledge:5001
MCP_UTILITIES_URL=http://mcp-utilities:5002

# Caching
MCP_CACHE_TTL=3600              # 1 hour
MCP_HEALTH_CHECK_INTERVAL=60    # 1 minute
MCP_MAX_RETRIES=3
MCP_TOOL_CACHE_SIZE=1000

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/1numbers
REDIS_URL=redis://redis:6379
WEAVIATE_URL=http://weaviate:8080

# LLM
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=mistral

# Logging
LOG_LEVEL=INFO
DEBUG=false
```

---

## Monitoring & Observability

### Health Checks

```bash
# Check all services
curl http://localhost:8000/health

# Backend health
curl http://localhost:8000/health

# MCP servers
curl http://localhost:5000/health  # Research
curl http://localhost:5001/health  # Knowledge
curl http://localhost:5002/health  # Utilities
```

### Metrics Endpoint

```bash
# Get tool statistics
curl http://localhost:8000/monitoring/mcp/stats

# Response
{
  "search_numerology_knowledge_research": {
    "calls": 42,
    "successes": 40,
    "failures": 2,
    "avg_duration": 150.5,
    "success_rate": 0.952
  }
}
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f mcp-research

# Filter by level
docker-compose logs -f | grep "ERROR"
```

---

## Testing

### Run Unit Tests

```bash
# All tests
pytest backend/ -v

# MCP tests only
pytest backend/tests/test_mcp_*.py -v

# With coverage
pytest backend/ --cov=backend --cov-report=html
```

### Integration Tests

```bash
# Test full workflow
pytest backend/tests/test_mcp_integration.py::TestMCPIntegration -v

# Test with docker-compose
docker-compose up -d
wait-for-health-checks
pytest backend/tests/ -v
```

---

## Troubleshooting

### MCP Server Not Responding

```bash
# Check if container is running
docker-compose ps | grep mcp

# Check logs
docker-compose logs mcp-research

# Restart service
docker-compose restart mcp-research
```

### Tools Not Discovered

```bash
# Clear tool cache
redis-cli FLUSHDB  # WARNING: Clears all Redis data

# Or specific key
redis-cli DEL "mcp_tools:research"

# Sync tools
curl -X POST http://localhost:8000/mcp/sync-tools
```

### High Tool Call Latency

```bash
# Check MCP server health
curl http://localhost:5000/health

# Monitor response times
docker-compose logs -f | grep "duration"

# Check resource usage
docker stats
```

---

## Performance Optimization

### Caching Strategy

1. **Tool Definitions** - Cached for 1 hour in Redis
2. **Calculation Results** - Cached indefinitely in PostgreSQL
3. **Knowledge Embeddings** - Cached in Weaviate
4. **Health Checks** - Cached for 1 minute

### Tuning

```bash
# Adjust cache TTL
MCP_CACHE_TTL=7200  # 2 hours

# Increase tool cache size
MCP_TOOL_CACHE_SIZE=5000

# Optimize Ollama
OLLAMA_NUM_GPU=1      # Use GPU if available
OLLAMA_THREADS=8      # CPU threads
```

---

## Deployment

### Production Deployment

```bash
# Build images
docker-compose build

# Push to registry
docker tag 1numbers-backend:latest myregistry/1numbers-backend:latest
docker push myregistry/1numbers-backend:latest

# Deploy to Kubernetes (example)
kubectl apply -f k8s/

# Or use docker-compose in swarm
docker stack deploy -c docker-compose.yml 1numbers
```

### Scaling

```yaml
# docker-compose.override.yml for scaling
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

---

## Roadmap

### Phase 1 (✅ Complete)
- [x] Basic calculator agent
- [x] FastAPI backend
- [x] REST + WebSocket APIs
- [x] Docker infrastructure

### Phase 2 (🔜 In Progress)
- [ ] Orchestrator agent (LangGraph)
- [ ] Interpreter agent (LLM + RAG)
- [ ] Knowledge management
- [ ] Research server implementation
- [ ] MCP client integration

### Phase 3 (🔗 Planned)
- [ ] Comparison agent
- [ ] Forecast agent
- [ ] Advanced MCP servers
- [ ] Production hardening

---

## Support

- **Documentation:** See README.md files in each directory
- **Issues:** Open GitHub issue with `[MCP]` tag
- **Questions:** Comment on relevant PR or discussion
- **Contributions:** Follow CONTRIBUTING.md guide

---

## License

See LICENSE file

---

**Made with ❤️ using FastAPI, LangGraph, and MCP**
