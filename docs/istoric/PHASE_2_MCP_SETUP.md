# Phase 2: MCP Integration Setup Guide

## Overview

Phase 2 implements **Model Context Protocol (MCP)** integration to enable:

- ✅ **Autonomous Research** - Discover new numerology utilities automatically
- ✅ **Multi-Server Architecture** - Manage multiple specialized MCP servers
- ✅ **Knowledge Discovery** - Extract and validate new calculation methods
- ✅ **Agent-Driven Expansion** - Self-expanding knowledge base
- ✅ **Production-Ready Scaling** - Enterprise-grade tool management

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         MCP Client Manager                             │  │
│  │  ┌─────────────┬─────────────┬──────────────┐         │  │
│  │  │  Tool Cache │  Server mgmt │  Health chk │         │  │
│  │  └─────────────┴─────────────┴──────────────┘         │  │
│  │                       │                               │  │
│  ├───────────────────────┼───────────────────────────────┤  │
│  │ ResearchAgent         │ Routes                         │  │
│  │ ├─ Discover utilities  │ ├─ /api/mcp/tools           │  │
│  │ ├─ Validate           │ ├─ /api/mcp/tool-call       │  │
│  │ ├─ Integrate          │ ├─ /api/research/*          │  │
│  │ └─ Update KB          │ └─ /api/compatibility/*      │  │
│  └───────────────────────┴───────────────────────────────┘  │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    MCP Research  MCP Knowledge   MCP Utilities
    Server #1     Server #2       Server #3
    (Tools)       (Search/RAG)    (Discovery)
```

---

## Component Breakdown

### 1. **MCP Research Server** (`mcp_servers/research/server.py`)

**5 Core Tools:**

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `search_numerology_knowledge` | Query knowledge base | query, source, limit | results[] |
| `analyze_number_patterns` | Find patterns | number, context, time_period | patterns[], frequency |
| `discover_new_utilities` | Autonomous discovery | category, search_depth | utilities[] |
| `fetch_compatibility_data` | Get compatibility matrices | type, include_historical | matrix{} |
| `validate_numerology_theory` | Validate interpretations | theory, sources[] | validated, confidence |

**Features:**
- Async/await for non-blocking execution
- Input validation and error handling
- Structured JSON responses
- Configurable search depth
- Theory validation with confidence scores

---

### 2. **MCP Client Manager** (`backend/mcp/client_manager.py`)

**Key Responsibilities:**

```python
class MCPClientManager:
    # Initialize connections to MCP servers
    async def initialize()
    
    # Discover all available tools
    async def get_all_tools()
    
    # Execute a specific tool
    async def call_tool(tool_name, arguments, server_name)
    
    # Monitor server health
    async def health_check()
```

**Caching Strategy:**
- **1-hour TTL** for tool definitions
- Redis-backed distributed cache
- Automatic invalidation on failures
- Fallback to cache if server unavailable

**Parallel Execution:**
```python
# Multiple tools executed concurrently
asyncio.gather(
    mcp.call_tool("search_...", args1),
    mcp.call_tool("analyze_...", args2),
    mcp.call_tool("validate_...", args3)
)
```

---

### 3. **Research Agent** (`backend/agents/research.py`)

**4-Phase Discovery Workflow:**

```
Phase 1: Scan for Utilities
  └─ Query 7 categories (cycles, compatibility, ...)
  └─ Collect all discovered utilities

Phase 2: Validate Discovered Utilities
  └─ LLM validation with confidence scoring
  └─ Filter by confidence threshold (0.7+)

Phase 3: Integrate into System
  └─ Register validated utilities
  └─ Store in database

Phase 4: Update Knowledge Base
  └─ Ingest into Weaviate RAG
  └─ Index for retrieval
```

**Key Methods:**

```python
async def discover_and_integrate_utilities() -> Dict
    # Main research workflow
    # Returns: new_found, validated, integrated counts

async def research_number(number: int, context: str) -> Dict
    # Research specific number with RAG enrichment

async def validate_interpretation(interpretation: str, number: int) -> Dict
    # Validate numerology theory against sources
```

---

### 4. **FastAPI Routes** (`backend/api/mcp_routes.py`)

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/api/numerology/calculate` | POST | Full numerology profile |
| `/api/agents/stream/{user_id}` | WS | Real-time streaming |
| `/api/mcp/tools` | GET | List all tools |
| `/api/mcp/tool-call` | POST | Direct tool execution |
| `/api/research/discover-utilities` | POST | Trigger autonomous research |
| `/api/research/results` | GET | Get research results |
| `/api/compatibility/compare` | POST | Multi-person compatibility |
| `/api/research/validate-theory` | POST | Theory validation |
| `/api/mcp/health` | GET | Server health check |

---

### 5. **Configuration** (`backend/config/mcp_config.py`)

**Server Configuration:**

```python
MCP_SERVERS = {
    "research": {
        "url": "http://localhost:5001",
        "timeout": 30
    },
    "knowledge": {
        "url": "http://localhost:5002",
        "timeout": 30
    },
    "utilities": {
        "url": "http://localhost:5003",
        "timeout": 30
    }
}
```

**Research Configuration:**

```python
RESEARCH_CONFIG = {
    "discovery_categories": 7,
    "validation_threshold": 0.7,
    "auto_discovery_interval": 86400,  # 24h
    "max_utilities_per_category": 10
}
```

---

## Installation & Setup

### Prerequisites

```bash
# Python 3.9+
python --version

# Docker & Docker Compose
docker --version
docker-compose --version
```

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt

# Additional MCP dependencies
pip install mcp httpx redis
```

### 2. Update Docker Compose

```yaml
version: '3.9'
services:
  mcp-research:
    build:
      context: ./mcp_servers/research
    ports:
      - "5001:5000"
    environment:
      - LOG_LEVEL=INFO
    networks:
      - 1numbers

  mcp-knowledge:
    build:
      context: ./mcp_servers/knowledge
    ports:
      - "5002:5000"
    depends_on:
      - postgres
      - weaviate
    networks:
      - 1numbers

  # ... existing services
networks:
  1numbers:
    driver: bridge
```

### 3. Configure Environment

```bash
# .env
MCP_RESEARCH_URL=http://mcp-research:5000
MCP_KNOWLEDGE_URL=http://mcp-knowledge:5000
MCP_UTILITIES_URL=http://mcp-utilities:5000

REDIS_URL=redis://redis:6379/0
TOOL_CACHE_TTL=3600

# Research settings
RESEARCH_AUTO_DISCOVERY=true
DISCOVERY_INTERVAL=86400
```

### 4. Initialize Database Schema

```sql
-- Tables for MCP integration
CREATE TABLE mcp_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'disconnected',
    health_check_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mcp_tools (
    id SERIAL PRIMARY KEY,
    server_id INTEGER REFERENCES mcp_servers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    input_schema JSONB,
    cached_at TIMESTAMP,
    UNIQUE(server_id, name)
);

CREATE TABLE discovered_utilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    accuracy DECIMAL(3,2),
    validation_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'discovered',
    registered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE research_results (
    id SERIAL PRIMARY KEY,
    query TEXT,
    results JSONB,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Usage Examples

### 1. List Available Tools

```bash
curl http://localhost:8000/api/mcp/tools \
  -H "Authorization: Bearer $TOKEN"

# Response
{
  "total": 15,
  "servers": ["research", "knowledge", "utilities"],
  "tools": [
    {
      "name": "search_numerology_knowledge",
      "description": "Search numerology databases...",
      "mcp_server": "research"
    }
  ]
}
```

### 2. Call MCP Tool Directly

```bash
curl -X POST http://localhost:8000/api/mcp/tool-call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "search_numerology_knowledge",
    "arguments": {
      "query": "life path 7 spirituality",
      "source": "classical",
      "limit": 5
    }
  }'
```

### 3. Trigger Autonomous Research

```bash
curl -X POST http://localhost:8000/api/research/discover-utilities \
  -H "Content-Type: application/json" \
  -d '{"category": "cycles"}'

# Response
{
  "status": "research_started",
  "message": "Autonomous research initiated for category: cycles"
}
```

### 4. WebSocket Real-Time Streaming

```javascript
const ws = new WebSocket('ws://localhost:8000/api/agents/stream/user_123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.data);
};

// Request calculation
ws.send(JSON.stringify({
  type: 'full_profile',
  name: 'John Doe',
  day: 15,
  month: 3,
  year: 1990
}));
```

---

## Monitoring & Observability

### Health Check

```bash
curl http://localhost:8000/api/mcp/health

# Response
{
  "status": "ok",
  "servers": {
    "research": {
      "status": "healthy",
      "response_time_ms": 45
    }
  },
  "timestamp": "2026-01-13T19:30:00Z"
}
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)
logger.info(f"✅ Connected to MCP server: research")
logger.error(f"❌ Tool execution failed: {error}")
```

### Metrics to Track

- Tool execution time (per tool, per server)
- Cache hit rate
- Discovery success rate
- Validation confidence scores
- Server response times
- Error rates by category

---

## Troubleshooting

### MCP Server Connection Issues

```bash
# Check if server is running
curl http://localhost:5001/health

# Check logs
docker logs mcp-research

# Verify network connectivity
docker exec backend nc -zv mcp-research 5000
```

### Tool Execution Failures

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test tool directly
result = await mcp.call_tool(
    "search_numerology_knowledge",
    {"query": "test"},
    "research"
)
print(f"Result: {result}")
```

### Redis Cache Issues

```bash
# Connect to Redis
redis-cli

# Check cache
GET mcp_tools:research

# Clear cache
FLUSHDB
```

---

## Performance Optimization

### 1. **Connection Pooling**

```python
# httpx handles this automatically with AsyncClient
client = httpx.AsyncClient(
    limits=httpx.Limits(max_connections=100)
)
```

### 2. **Caching Strategy**

- Tool definitions: 1 hour TTL
- Compatibility matrices: 24 hours
- Research results: 7 days

### 3. **Batch Tool Calls**

```python
# Execute multiple tools in parallel
results = await asyncio.gather(
    mcp.call_tool("search_...", args1),
    mcp.call_tool("analyze_...", args2),
    return_exceptions=True
)
```

### 4. **Query Optimization**

- Index frequently searched categories
- Paginate large result sets
- Use search filters effectively

---

## Next Steps (Phase 3)

- [ ] Add more MCP servers (knowledge, utilities)
- [ ] Implement advanced discovery algorithms
- [ ] Add LLM-powered insights
- [ ] Create admin dashboard for utilities management
- [ ] Build predictive discovery models

---

## Support

For issues or questions:
1. Check logs: `docker logs 1numbers-backend`
2. Review MCP documentation
3. Submit issue on GitHub

