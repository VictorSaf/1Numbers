# 1Numbers: Comprehensive API Reference
## Complete REST API & WebSocket Documentation with Examples

**Version**: 5.0  
**Last Updated**: January 13, 2026  
**Base URL**: `https://api.1numbers.com` (Production)  
**Development**: `http://localhost:8000`

---

## TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Profiles](#profiles)
4. [Numerology Calculations](#numerology-calculations)
5. [Compatibility Analysis](#compatibility-analysis)
6. [AI & Interpretations](#ai--interpretations)
7. [Research & Knowledge](#research--knowledge)
8. [Recommendations](#recommendations)
9. [Chat & Conversations](#chat--conversations)
10. [MCP Tools](#mcp-tools)
11. [Administration](#administration)
12. [WebSocket Streaming](#websocket-streaming)
13. [Error Handling](#error-handling)
14. [Rate Limiting](#rate-limiting)
15. [Pagination](#pagination)

---

## AUTHENTICATION

### JWT Token Overview

**Token Type**: Bearer Token (JWT HS256)  
**Expiration**: 24 hours (access token), 7 days (refresh token)  
**Header**: `Authorization: Bearer <token>`

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-01-13T20:00:00Z"
  }
}
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "secure-password",
  "name": "Jane Smith"
}
```

**Response** (201 Created):
```json
{
  "id": "user-456",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "created_at": "2026-01-13T20:05:00Z"
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## USER MANAGEMENT

### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatars/user-123.jpg",
  "bio": "Numerology enthusiast",
  "created_at": "2026-01-13T20:00:00Z",
  "updated_at": "2026-01-13T20:00:00Z",
  "preferences": {
    "notification_email": true,
    "language": "en",
    "theme": "dark",
    "privacy": "private"
  },
  "statistics": {
    "total_profiles": 5,
    "total_calculations": 127,
    "last_active": "2026-01-13T20:00:00Z"
  }
}
```

### Update User Profile

```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "avatar": "https://example.com/avatars/new-avatar.jpg",
  "bio": "Updated bio",
  "preferences": {
    "notification_email": false,
    "language": "es",
    "theme": "light"
  }
}
```

**Response** (200 OK): Updated user object

### Change Password

```http
POST /users/me/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "old-password",
  "new_password": "new-secure-password"
}
```

**Response** (200 OK):
```json
{
  "message": "Password changed successfully"
}
```

### Delete Account

```http
DELETE /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "confirm-password"
}
```

**Response** (204 No Content)

---

## PROFILES

### Create Profile

```http
POST /profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "birth_date": "1990-05-15",
  "birth_time": "14:30",
  "birth_place": "New York, USA",
  "notes": "Personal profile"
}
```

**Response** (201 Created):
```json
{
  "id": "profile-789",
  "user_id": "user-123",
  "name": "John Doe",
  "birth_date": "1990-05-15",
  "birth_time": "14:30",
  "birth_place": "New York, USA",
  "notes": "Personal profile",
  "created_at": "2026-01-13T20:00:00Z",
  "updated_at": "2026-01-13T20:00:00Z"
}
```

### Get Profile

```http
GET /profiles/{profile_id}
Authorization: Bearer <token>
```

**Response** (200 OK): Profile object with calculations

### List Profiles

```http
GET /profiles?page=1&limit=10
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": [
    {"id": "profile-1", "name": "Profile 1", ...},
    {"id": "profile-2", "name": "Profile 2", ...}
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Update Profile

```http
PUT /profiles/{profile_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "notes": "Updated notes"
}
```

**Response** (200 OK): Updated profile object

### Delete Profile

```http
DELETE /profiles/{profile_id}
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

## NUMEROLOGY CALCULATIONS

### Full Profile Calculation

```http
POST /numerology/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "birth_date": "1990-05-15",
  "system": "pythagorean"
}
```

**Response** (200 OK):
```json
{
  "calculation_id": "calc-123",
  "system": "pythagorean",
  "numbers": {
    "life_path": {
      "value": 7,
      "meaning": "The Seeker - Intuition, analysis, spirituality",
      "strengths": ["Intuitive", "Analytical", "Spiritual"],
      "challenges": ["Withdrawn", "Skeptical", "Secretive"]
    },
    "expression": {
      "value": 9,
      "meaning": "The Humanitarian - Compassion, wisdom, completion",
      "strengths": ["Compassionate", "Wise", "Idealistic"],
      "challenges": ["Scattered", "Idealistic", "Prone to suffering"]
    },
    "soul_urge": {
      "value": 5,
      "meaning": "The Free Spirit - Freedom, adventure, change"
    },
    "personality": {
      "value": 4,
      "meaning": "The Builder - Stability, order, responsibility"
    },
    "destiny": {
      "value": 11,
      "is_master_number": true,
      "meaning": "The Visionary - Intuition, enlightenment, revelation"
    },
    "birth_day": {
      "value": 6,
      "meaning": "The Nurturer"
    }
  },
  "compatibility_score": 85,
  "personal_year": 5,
  "personal_month": 3,
  "personal_day": 2,
  "calculated_at": "2026-01-13T20:00:00Z",
  "execution_time_ms": 245
}
```

### Life Path Only

```http
POST /numerology/life-path
Content-Type: application/json

{
  "birth_date": "1990-05-15"
}
```

**Response** (200 OK):
```json
{
  "life_path": 7,
  "is_master_number": false,
  "meaning": "The Seeker - Intuition, analysis, spirituality",
  "description": "Life Path 7 individuals are the seekers...",
  "strengths": ["Intuitive", "Analytical", "Spiritual", "Reserved", "Mysterious"],
  "weaknesses": ["Withdrawn", "Skeptical", "Secretive", "Aloof", "Cynical"],
  "career_paths": ["Researcher", "Analyst", "Spiritual teacher", "Scientist"],
  "relationship_advice": "As a Life Path 7, you value depth and authenticity..."
}
```

### Expression Number

```http
POST /numerology/expression
Content-Type: application/json

{
  "name": "John Doe"
}
```

**Response** (200 OK): Expression number details

### Soul Urge Number

```http
POST /numerology/soul-urge
Content-Type: application/json

{
  "name": "John Doe"
}
```

**Response** (200 OK): Soul urge number details

### Personal Year

```http
GET /numerology/personal-year?birth_date=1990-05-15&year=2026
```

**Response** (200 OK):
```json
{
  "year": 2026,
  "personal_year": 5,
  "meaning": "Year of Change - Freedom, adventure, adaptation",
  "theme": "This year emphasizes change and freedom...",
  "monthly_breakdown": [
    {"month": 1, "personal_month": 6, "theme": "Harmony and family focus"},
    {"month": 2, "personal_month": 7, "theme": "Introspection and analysis"},
    {"month": 3, "personal_month": 8, "theme": "Power and achievement"}
  ]
}
```

### Pinnacle Cycles

```http
GET /numerology/pinnacles?birth_date=1990-05-15
```

**Response** (200 OK):
```json
{
  "first_pinnacle": {
    "number": 4,
    "age_start": 0,
    "age_end": 36,
    "meaning": "Foundation and stability"
  },
  "second_pinnacle": {
    "number": 5,
    "age_start": 36,
    "age_end": 45,
    "meaning": "Freedom and change"
  },
  "third_pinnacle": {
    "number": 9,
    "age_start": 45,
    "age_end": 54,
    "meaning": "Completion and wisdom"
  },
  "fourth_pinnacle": {
    "number": 8,
    "age_start": 54,
    "age_end": 100,
    "meaning": "Power and abundance"
  }
}
```

---

## COMPATIBILITY ANALYSIS

### Two-Profile Compatibility

```http
POST /compatibility/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile1_id": "profile-1",
  "profile2_id": "profile-2",
  "analysis_type": "full"
}
```

**Response** (200 OK):
```json
{
  "compatibility_id": "compat-123",
  "profile1": {"id": "profile-1", "name": "John Doe"},
  "profile2": {"id": "profile-2", "name": "Jane Smith"},
  "overall_score": 78,
  "scores": {
    "life_path": {"score": 85, "interpretation": "Excellent compatibility"},
    "expression": {"score": 72, "interpretation": "Good compatibility"},
    "soul_urge": {"score": 68, "interpretation": "Compatible"},
    "birth_day": {"score": 75, "interpretation": "Compatible"}
  },
  "relationship_type": "romantic",
  "strengths": [
    "Shared values and spirituality",
    "Complementary strengths",
    "Similar communication styles"
  ],
  "challenges": [
    "Different approaches to change",
    "Varying emotional needs",
    "Different life pace preferences"
  ],
  "advice": "As a 7 and 5 combination, you bring...",
  "calculated_at": "2026-01-13T20:00:00Z"
}
```

### Quick Compatibility (without profiles)

```http
POST /compatibility/quick
Content-Type: application/json

{
  "profile1": {
    "name": "John Doe",
    "birth_date": "1990-05-15"
  },
  "profile2": {
    "name": "Jane Smith",
    "birth_date": "1992-08-22"
  }
}
```

**Response** (200 OK): Compatibility analysis

### Business Compatibility

```http
POST /compatibility/business
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile1_id": "profile-1",
  "profile2_id": "profile-2"
}
```

**Response** (200 OK):
```json
{
  "compatibility_score": 82,
  "business_synergy": {
    "leadership": "Complementary",
    "decision_making": "Balanced",
    "communication": "Effective",
    "conflict_resolution": "Good",
    "risk_tolerance": "Compatible"
  },
  "recommendations": [
    "Person 1 should lead strategy, Person 2 handles operations",
    "Schedule regular alignment meetings",
    "Leverage each person's natural strengths"
  ]
}
```

---

## AI & INTERPRETATIONS

### Get AI Interpretation

```http
POST /ai/interpret
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile_id": "profile-123",
  "focus": "life_path",
  "depth": "detailed"
}
```

**Response** (200 OK):
```json
{
  "interpretation_id": "interp-123",
  "profile_id": "profile-123",
  "focus": "life_path",
  "content": "As a Life Path 7, you are naturally drawn to the mysterious and the unknown...",
  "depth": "detailed",
  "tokens_used": 1250,
  "generated_at": "2026-01-13T20:00:00Z",
  "model": "gpt-4"
}
```

### Get Life Guidance

```http
POST /ai/guidance
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile_id": "profile-123",
  "question": "What should I focus on this year?",
  "personal_year": 5
}
```

**Response** (200 OK):
```json
{
  "guidance_id": "guid-123",
  "answer": "Given your Life Path 7 and current Personal Year 5 cycle, this is a time for...",
  "reasoning": "Your numerological profile suggests...",
  "recommendations": [
    "Embrace change while maintaining your spiritual practice",
    "Trust your intuition in making decisions",
    "Seek knowledge through experience"
  ]
}
```

### Get Compatibility Insight

```http
POST /ai/compatibility-insight
Authorization: Bearer <token>
Content-Type: application/json

{
  "compatibility_id": "compat-123",
  "topic": "communication"
}
```

**Response** (200 OK):
```json
{
  "insight_id": "insight-123",
  "topic": "communication",
  "insight": "Your 7-5 pairing presents interesting communication dynamics...",
  "tips": [
    "7s prefer deep, meaningful conversations; 5s enjoy variety",
    "Schedule dedicated talk time",
    "Use written communication for important topics"
  ]
}
```

---

## RESEARCH & KNOWLEDGE

### List MCP Tools

```http
GET /mcp/tools
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "total": 5,
  "tools": [
    {
      "name": "search_numerology_knowledge",
      "description": "Search numerology databases for knowledge",
      "server": "research",
      "parameters": {
        "query": "string (required)",
        "source": "enum: classical|modern|mystical|scientific",
        "limit": "integer (default: 5)"
      }
    },
    {
      "name": "analyze_number_patterns",
      "description": "Find patterns in numerology data",
      "server": "research"
    }
  ],
  "servers": ["research"]
}
```

### Call MCP Tool

```http
POST /mcp/tool-call
Authorization: Bearer <token>
Content-Type: application/json

{
  "tool_name": "search_numerology_knowledge",
  "arguments": {
    "query": "life path 7 spirituality",
    "source": "classical",
    "limit": 10
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tool": "search_numerology_knowledge",
  "server": "research",
  "result": {
    "query": "life path 7 spirituality",
    "source": "classical",
    "results": [
      {
        "title": "The Seeker's Path",
        "content": "Life Path 7 individuals are natural seekers...",
        "confidence": 0.95,
        "source": "classical_numerology_texts"
      }
    ]
  },
  "execution_time_ms": 342
}
```

### Trigger Research Discovery

```http
POST /research/discover-utilities
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "cycles",
  "search_depth": "medium"
}
```

**Response** (202 Accepted):
```json
{
  "status": "research_started",
  "message": "Autonomous research initiated for category: cycles",
  "job_id": "research-job-789",
  "estimated_completion": "2026-01-13T20:10:00Z"
}
```

### Get Research Results

```http
GET /research/results?limit=20&offset=0
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "total": 45,
  "results": [
    {
      "id": "result-1",
      "type": "discovered_utility",
      "name": "Advanced Pinnacle Calculator",
      "description": "Enhanced pinnacle calculation method",
      "accuracy": 0.98,
      "discovered_at": "2026-01-12T18:00:00Z",
      "status": "integrated",
      "validation_score": 0.92
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45
  }
}
```

### Search Knowledge Base

```http
GET /research/search?query=life%20path%207&source=classical
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "query": "life path 7",
  "source": "classical",
  "total_results": 127,
  "results": [
    {
      "id": "doc-1",
      "title": "Life Path 7: The Seeker",
      "excerpt": "Life Path 7 individuals are natural seekers of truth...",
      "relevance": 0.98,
      "source": "classical_texts"
    }
  ]
}
```

---

## RECOMMENDATIONS

### Get Personalized Recommendations

```http
GET /recommendations?profile_id=profile-123&limit=5
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "profile_id": "profile-123",
  "total": 5,
  "recommendations": [
    {
      "id": "rec-1",
      "type": "article",
      "title": "Deepening Spiritual Practice for Life Path 7",
      "description": "Explore meditation and introspection techniques...",
      "url": "https://1numbers.com/articles/life-path-7-spirituality",
      "relevance_score": 0.95,
      "reason": "Based on your Life Path 7 and current Personal Year 5"
    },
    {
      "id": "rec-2",
      "type": "course",
      "title": "Numerology for Personal Growth",
      "description": "A comprehensive course on using numerology...",
      "url": "https://1numbers.com/courses/numerology-growth",
      "relevance_score": 0.88
    }
  ]
}
```

### Get Similar Users

```http
GET /recommendations/similar-users?profile_id=profile-123&limit=10
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "profile_id": "profile-123",
  "total": 10,
  "similar_users": [
    {
      "user_id": "user-456",
      "name": "Jane Smith",
      "similarity_score": 0.92,
      "shared_life_path": true,
      "shared_expression": false
    }
  ]
}
```

---

## CHAT & CONVERSATIONS

### Start Conversation

```http
POST /chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile_id": "profile-123",
  "topic": "life_path",
  "title": "My Life Path 7 Journey"
}
```

**Response** (201 Created):
```json
{
  "conversation_id": "conv-123",
  "profile_id": "profile-123",
  "topic": "life_path",
  "title": "My Life Path 7 Journey",
  "created_at": "2026-01-13T20:00:00Z",
  "messages": []
}
```

### Send Message

```http
POST /chat/conversations/{conversation_id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How can I better use my analytical nature?"
}
```

**Response** (200 OK):
```json
{
  "user_message": {
    "id": "msg-1",
    "role": "user",
    "content": "How can I better use my analytical nature?",
    "timestamp": "2026-01-13T20:00:00Z"
  },
  "ai_response": {
    "id": "msg-2",
    "role": "assistant",
    "content": "As a Life Path 7, your analytical nature is one of your greatest strengths...",
    "timestamp": "2026-01-13T20:00:01Z",
    "tokens_used": 450
  }
}
```

### Get Conversation History

```http
GET /chat/conversations/{conversation_id}?limit=50
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "conversation_id": "conv-123",
  "messages": [
    {"id": "msg-1", "role": "user", "content": "...", "timestamp": "2026-01-13T20:00:00Z"},
    {"id": "msg-2", "role": "assistant", "content": "...", "timestamp": "2026-01-13T20:00:01Z"}
  ],
  "total_messages": 25,
  "pagination": {"limit": 50, "offset": 0}
}
```

### Delete Conversation

```http
DELETE /chat/conversations/{conversation_id}
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

## WEBSOCKET STREAMING

### Real-time Agent Streaming

```javascript
const ws = new WebSocket('wss://api.1numbers.com/agents/stream/user-123?token=JWT_TOKEN');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'full_profile',
    name: 'John Doe',
    day: 15,
    month: 5,
    year: 1990,
    system: 'pythagorean'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'progress') {
    console.log(`Progress: ${message.step} (${message.progress}%`);
  } else if (message.type === 'calculation') {
    console.log('Number calculated:', message.data);
  } else if (message.type === 'complete') {
    console.log('Calculation complete:', message.result);
  } else if (message.type === 'error') {
    console.error('Error:', message.error);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

**Server Messages**:

```json
{
  "type": "progress",
  "step": "parsing_input",
  "progress": 10
}

{
  "type": "calculation",
  "number_type": "life_path",
  "data": {"value": 7, "meaning": "The Seeker"}
}

{
  "type": "complete",
  "result": {"calculation_id": "calc-123", ...}
}

{
  "type": "error",
  "error": "Invalid birth date"
}
```

### Real-time Chat Streaming

```javascript
const ws = new WebSocket('wss://api.1numbers.com/chat/stream/conv-123?token=JWT_TOKEN');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'message') {
    console.log(`${message.role}: ${message.content}`);
  } else if (message.type === 'thinking') {
    console.log('AI thinking...');
  } else if (message.type === 'complete') {
    console.log('Response complete');
  }
};
```

---

## ERROR HANDLING

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "birth_date",
        "message": "Invalid date format. Use YYYY-MM-DD"
      }
    ],
    "request_id": "req-123-abc",
    "timestamp": "2026-01-13T20:00:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|----------|
| INVALID_TOKEN | 401 | JWT token is invalid or expired |
| UNAUTHORIZED | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 422 | Input validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## RATE LIMITING

**Rate Limits**:
- Free tier: 100 requests/hour
- Premium tier: 1000 requests/hour
- Enterprise: Custom limits

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1673646000
```

**429 Response**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 3600
  }
}
```

---

## PAGINATION

**Query Parameters**:
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Results per page

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 247,
    "pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## ADMINISTRATION

### Get System Health

```http
GET /admin/health
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": {"status": "connected", "response_time_ms": 5},
  "redis": {"status": "connected", "response_time_ms": 2},
  "mcp_research": {"status": "healthy", "response_time_ms": 45},
  "openai_api": {"status": "connected", "response_time_ms": 120},
  "uptime_hours": 720,
  "requests_per_minute": 450
}
```

### Get System Metrics

```http
GET /admin/metrics
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "active_users": 1245,
  "total_profiles": 5890,
  "total_calculations": 45230,
  "api_requests_24h": 180000,
  "error_rate": 0.02,
  "average_response_time_ms": 185,
  "cache_hit_rate": 0.87,
  "storage_used_gb": 125
}
```

---

## QUICK REFERENCE

### Authentication Header

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.1numbers.com/users/me
```

### Python Example

```python
import requests

headers = {"Authorization": f"Bearer {token}"}
response = requests.get("https://api.1numbers.com/users/me", headers=headers)
user = response.json()
print(user['name'])
```

### JavaScript Example

```javascript
const response = await fetch('https://api.1numbers.com/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
console.log(user.name);
```

### cURL Example

```bash
curl -X POST https://api.1numbers.com/numerology/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "birth_date": "1990-05-15",
    "system": "pythagorean"
  }'
```

---

## CHANGELOG

### v5.0 (January 13, 2026)
- Complete API documentation
- WebSocket streaming endpoints
- MCP tool integration
- Research discovery endpoints
- AI interpretation endpoints
- Recommendation system
- Chat conversations

### v4.0
- Core numerology calculations
- Compatibility analysis
- Profile management
- Basic authentication

---

**Need Help?**  
- View API docs at `/docs` (Swagger UI)
- Check `/redoc` for ReDoc documentation
- Contact support@1numbers.com

**Last Updated**: January 13, 2026
