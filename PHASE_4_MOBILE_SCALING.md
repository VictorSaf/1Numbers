# 1Numbers v4.0: Phase 4 - Mobile App & API Scaling
## React Native Mobile & Production Infrastructure

---

## PART A: REACT NATIVE MOBILE APPLICATION

### Project Setup

**mobile/package.json:**
```json
{
  "name": "1numbers-mobile",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:ios": "cd ios && xcodebuild -workspace 1Numbers.xcworkspace -scheme 1Numbers -configuration Release"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0",
    "react-navigation": "^6.1.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-redux": "^8.1.0",
    "@reduxjs/toolkit": "^1.9.0",
    "axios": "^1.3.0",
    "react-native-async-storage": "^1.17.0",
    "react-native-gesture-handler": "^2.12.0",
    "react-native-reanimated": "^3.3.0",
    "react-native-safe-area-context": "^4.5.0",
    "react-native-screens": "^3.20.0",
    "react-native-vector-icons": "^9.2.0",
    "date-fns": "^2.29.0",
    "numeral": "^2.0.6"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@types/react-native": "^0.72.0",
    "typescript": "^4.9.0",
    "jest": "^29.2.0",
    "@react-native-community/eslint-config": "^3.1.0"
  }
}
```

### Core Mobile Architecture

**mobile/src/app.tsx:**
```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

import store from './store';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUser } from './store/authSlice';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import CalculatorScreen from './screens/numerology/CalculatorScreen';
import ResultsScreen from './screens/numerology/ResultsScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import CompatibilityScreen from './screens/compatibility/CompatibilityScreen';
import ResearchScreen from './screens/research/ResearchScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import SettingsScreen from './screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Calculator') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Compatibility') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Research') {
            iconName = focused ? 'magnify' : 'magnify';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          
          return <Icons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2180708',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      })}
    >
      <Tab.Screen 
        name="Calculator" 
        component={CalculatorScreen}
        options={{ title: 'Calculate' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Compatibility" 
        component={CompatibilityScreen}
        options={{ title: 'Compatibility' }}
      />
      <Tab.Screen 
        name="Research" 
        component={ResearchScreen}
        options={{ title: 'Research' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isLoading, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        dispatch(setUser(JSON.parse(userData)));
      }
    } catch (e) {
      // Ignore restore errors
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
```

### Key Mobile Screens

**mobile/src/screens/numerology/CalculatorScreen.tsx:**
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { calculateNumerology } from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CalculatorScreen = () => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [system, setSystem] = useState('pythagorean');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleCalculate = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const result = await calculateNumerology({
        name,
        day: birthDate.getDate(),
        month: birthDate.getMonth() + 1,
        year: birthDate.getFullYear(),
        system,
      });

      dispatch(addProfile(result));
    } catch (error) {
      alert('Calculation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Numerology Calculator</Text>
        <Text style={styles.subtitle}>Discover your numbers</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#2180708" />
            <Text style={styles.dateText}>
              {birthDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setBirthDate(date || birthDate);
              setShowDatePicker(false);
            }}
          />
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>System</Text>
          <View style={styles.systemSelector}>
            {['pythagorean', 'chaldean'].map(sys => (
              <TouchableOpacity
                key={sys}
                style={[
                  styles.systemButton,
                  system === sys && styles.systemButtonActive,
                ]}
                onPress={() => setSystem(sys)}
              >
                <Text
                  style={[
                    styles.systemButtonText,
                    system === sys && styles.systemButtonTextActive,
                  ]}
                >
                  {sys.charAt(0).toUpperCase() + sys.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, loading && styles.buttonDisabled]}
          onPress={handleCalculate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="calculator" size={20} color="#fff" />
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  systemSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  systemButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  systemButtonActive: {
    backgroundColor: '#2180708',
    borderColor: '#2180708',
  },
  systemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  systemButtonTextActive: {
    color: '#fff',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2180708',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    gap: 10,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CalculatorScreen;
```

---

## PART B: API SCALING & PRODUCTION INFRASTRUCTURE

### API Gateway with Load Balancing

**infrastructure/docker-compose.prod.yml:**
```yaml
version: '3.9'

services:
  # API Gateway (Nginx)
  nginx:
    image: nginx:alpine
    container_name: 1numbers-gateway
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./api-logs:/var/log/nginx:rw
    depends_on:
      - backend-1
      - backend-2
      - backend-3
    networks:
      - 1numbers
    environment:
      - NGINX_HOST=api.1numbers.com
      - NGINX_PORT=80

  # Backend Replicas (3 instances)
  backend-1:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: 1numbers-backend-1
    environment:
      - PYTHONUNBUFFERED=1
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - MCP_SERVERS=${MCP_SERVERS}
      - ENVIRONMENT=production
      - INSTANCE_ID=backend-1
    depends_on:
      - postgres
      - redis
      - mcp-research
    networks:
      - 1numbers
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend-2:
    extends: backend-1
    container_name: 1numbers-backend-2
    environment:
      - INSTANCE_ID=backend-2

  backend-3:
    extends: backend-1
    container_name: 1numbers-backend-3
    environment:
      - INSTANCE_ID=backend-3

  # PostgreSQL with Replication
  postgres:
    image: postgres:15-alpine
    container_name: 1numbers-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=1numbers
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - 1numbers
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cluster (3 nodes)
  redis-1:
    image: redis:7-alpine
    container_name: 1numbers-redis-1
    command: redis-server --cluster-enabled yes --cluster-config-file /data/nodes.conf --cluster-node-timeout 5000
    volumes:
      - redis-1-data:/data
    networks:
      - 1numbers
    ports:
      - "6379:6379"

  redis-2:
    image: redis:7-alpine
    container_name: 1numbers-redis-2
    command: redis-server --cluster-enabled yes --cluster-config-file /data/nodes.conf --cluster-node-timeout 5000 --port 6380
    volumes:
      - redis-2-data:/data
    networks:
      - 1numbers
    ports:
      - "6380:6380"

  redis-3:
    image: redis:7-alpine
    container_name: 1numbers-redis-3
    command: redis-server --cluster-enabled yes --cluster-config-file /data/nodes.conf --cluster-node-timeout 5000 --port 6381
    volumes:
      - redis-3-data:/data
    networks:
      - 1numbers
    ports:
      - "6381:6381"

  # MCP Research Server
  mcp-research:
    build:
      context: ./mcp_servers/research
      dockerfile: Dockerfile
    container_name: 1numbers-mcp-research
    environment:
      - PYTHONUNBUFFERED=1
      - DATABASE_URL=${DATABASE_URL}
      - LOG_LEVEL=info
    depends_on:
      - postgres
    networks:
      - 1numbers
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring & Observability
  prometheus:
    image: prom/prometheus:latest
    container_name: 1numbers-prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - 1numbers
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: 1numbers-grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=redis-datasource
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    depends_on:
      - prometheus
    networks:
      - 1numbers
    ports:
      - "3000:3000"

volumes:
  postgres-data:
  redis-1-data:
  redis-2-data:
  redis-3-data:
  prometheus-data:
  grafana-data:

networks:
  1numbers:
    driver: bridge
```

### Nginx Load Balancer Configuration

**infrastructure/nginx.conf:**
```nginx
upstream backend_servers {
    least_conn;
    server backend-1:8000 weight=1 max_fails=3 fail_timeout=30s;
    server backend-2:8000 weight=1 max_fails=3 fail_timeout=30s;
    server backend-3:8000 weight=1 max_fails=3 fail_timeout=30s;
    
    keepalive 32;
}

upstream mcp_servers {
    server mcp-research:5000;
    keepalive 16;
}

server {
    listen 80;
    server_name api.1numbers.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.1numbers.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Compression
    gzip on;
    gzip_types application/json;
    gzip_min_length 1000;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    
    # Health check endpoint (no logging)
    location /health {
        access_log off;
        proxy_pass http://backend_servers;
    }
    
    # Auth endpoints (strict rate limiting)
    location /api/auth {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # WebSocket upgrade
    location /agents/stream {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket timeout
        proxy_read_timeout 86400;
    }
    
    # MCP servers (internal only)
    location /mcp/ {
        allow 172.20.0.0/16;  # Docker network
        deny all;
        
        proxy_pass http://mcp_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### Database Optimization

**backend/database/migration_manager.py:**
```python
from sqlalchemy import create_engine, text
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from alembic.operations import Operations
import logging

logger = logging.getLogger(__name__)

class MigrationManager:
    """Manages database migrations and optimizations"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = create_engine(database_url)
    
    async def run_migrations(self):
        """Run pending migrations"""
        try:
            with self.engine.begin() as connection:
                ctx = MigrationContext.configure(connection)
                op = Operations(ctx)
                
                # Run optimizations
                logger.info("Running database optimizations...")
                await self._optimize_indices(op)
                await self._optimize_partitions(op)
                await self._analyze_tables(connection)
                
            logger.info("✅ Migrations completed successfully")
        except Exception as e:
            logger.error(f"Migration error: {e}")
            raise
    
    async def _optimize_indices(self, op: Operations):
        """Create optimized indices"""
        indices = [
            # User table indices
            ('idx_users_email', 'users', ['email'], True),
            ('idx_users_created_at', 'users', ['created_at']),
            
            # Profile table indices
            ('idx_profiles_user_id', 'profiles', ['user_id']),
            ('idx_profiles_life_path', 'profiles', ['life_path']),
            ('idx_profiles_created_at', 'profiles', ['created_at']),
            
            # Research results indices
            ('idx_research_category', 'research_results', ['category']),
            ('idx_research_timestamp', 'research_results', ['timestamp']),
            
            # Compatibility indices
            ('idx_compatibility_profile1', 'compatibility', ['profile_id_1']),
            ('idx_compatibility_profile2', 'compatibility', ['profile_id_2']),
            ('idx_compatibility_score', 'compatibility', ['compatibility_score']),
        ]
        
        for idx_name, table, columns, unique in [(i[0], i[1], i[2], i[3] if len(i) > 3 else False) for i in indices]:
            try:
                op.create_index(idx_name, table, columns, unique=unique)
                logger.info(f"✓ Created index: {idx_name}")
            except Exception as e:
                logger.warning(f"Index {idx_name} may already exist: {e}")
    
    async def _optimize_partitions(self, op: Operations):
        """Partition large tables for performance"""
        logger.info("Setting up table partitions...")
        
        # Partition research_results by year
        partition_query = """
        CREATE TABLE IF NOT EXISTS research_results_y2026 PARTITION OF research_results
        FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
        """
        
        try:
            op.execute(text(partition_query))
            logger.info("✓ Partitioned research_results table")
        except Exception as e:
            logger.warning(f"Partition may already exist: {e}")
    
    async def _analyze_tables(self, connection):
        """Analyze and vacuum tables"""
        tables = ['users', 'profiles', 'research_results', 'compatibility']
        
        for table in tables:
            try:
                connection.execute(text(f"VACUUM ANALYZE {table}"))
                logger.info(f"✓ Analyzed table: {table}")
            except Exception as e:
                logger.warning(f"Could not analyze {table}: {e}")
```

### Caching Strategy

**backend/cache/cache_manager.py:**
```python
import redis.asyncio as aioredis
from typing import Any, Optional
import json
import hashlib
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Advanced caching with multi-level strategy"""
    
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
        
        # Cache TTLs (seconds)
        self.ttls = {
            'profile': 3600,              # 1 hour
            'compatibility': 7200,         # 2 hours
            'research': 86400,             # 24 hours
            'user_settings': 604800,       # 7 days
            'mcp_tools': 3600,            # 1 hour
        }
    
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis = await aioredis.from_url(self.redis_url)
            logger.info("✅ Cache system initialized")
        except Exception as e:
            logger.error(f"Cache initialization failed: {e}")
            raise
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.redis.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl_type: str = 'profile'):
        """Set value in cache"""
        try:
            ttl = self.ttls.get(ttl_type, 3600)
            await self.redis.setex(
                key,
                ttl,
                json.dumps(value)
            )
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """Delete value from cache"""
        try:
            await self.redis.delete(key)
            logger.debug(f"Cache DELETE: {key}")
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    async def invalidate_user_cache(self, user_id: str):
        """Invalidate all cache for a user"""
        try:
            pattern = f"user:{user_id}:*"
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
                logger.info(f"Invalidated {len(keys)} cache entries for user {user_id}")
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
    
    def generate_key(self, prefix: str, *args) -> str:
        """Generate cache key with args"""
        key_parts = [prefix] + [str(arg) for arg in args]
        key_string = ":".join(key_parts)
        return key_string
    
    def hash_key(self, key: str) -> str:
        """Generate hash key for long strings"""
        return hashlib.sha256(key.encode()).hexdigest()
```

---

## PART C: MONITORING & OBSERVABILITY

### Prometheus Metrics

**backend/monitoring/metrics.py:**
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import logging

logger = logging.getLogger(__name__)

# Request metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=(0.1, 0.5, 1, 2, 5, 10)
)

# Calculation metrics
calculation_duration = Histogram(
    'numerology_calculation_duration_seconds',
    'Numerology calculation duration',
    ['system', 'type'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1)
)

calculation_count = Counter(
    'numerology_calculations_total',
    'Total numerology calculations',
    ['system', 'type']
)

# Cache metrics
cache_hits = Counter(
    'cache_hits_total',
    'Cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cache_misses_total',
    'Cache misses',
    ['cache_type']
)

# MCP metrics
mcp_tool_execution_time = Histogram(
    'mcp_tool_execution_seconds',
    'MCP tool execution time',
    ['tool_name'],
    buckets=(0.1, 0.5, 1, 2, 5, 10, 30)
)

mcp_tool_errors = Counter(
    'mcp_tool_errors_total',
    'MCP tool errors',
    ['tool_name']
)

# Database metrics
db_query_duration = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['query_type'],
    buckets=(0.001, 0.01, 0.1, 0.5, 1)
)

# Queue metrics
queue_size = Gauge(
    'job_queue_size',
    'Background job queue size'
)

# Active users
active_users = Gauge(
    'active_users',
    'Number of active users'
)

def init_metrics(port: int = 8001):
    """Initialize Prometheus metrics endpoint"""
    try:
        start_http_server(port)
        logger.info(f"✅ Prometheus metrics started on port {port}")
    except Exception as e:
        logger.error(f"Failed to start metrics: {e}")
```

---

## PART D: DEPLOYMENT & CI/CD

### GitHub Actions Workflow

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Run tests
        run: pytest tests/ --cov=backend --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
      
      - name: Run linting
        run: |
          flake8 backend/ --count --select=E9,F63,F7,F82 --show-source --statistics
          black --check backend/
          isort --check-only backend/

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -f backend/Dockerfile.prod -t 1numbers-backend:${{ github.sha }} .
          docker build -f mcp_servers/research/Dockerfile -t 1numbers-mcp-research:${{ github.sha }} .
      
      - name: Login to Docker registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Push images
        run: |
          docker tag 1numbers-backend:${{ github.sha }} ghcr.io/${{ github.repository }}/backend:latest
          docker push ghcr.io/${{ github.repository }}/backend:latest
          docker tag 1numbers-mcp-research:${{ github.sha }} ghcr.io/${{ github.repository }}/mcp-research:latest
          docker push ghcr.io/${{ github.repository }}/mcp-research:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          echo "${{ secrets.DEPLOY_KEY }}" > deploy_key
          chmod 600 deploy_key
          ssh -i deploy_key -o StrictHostKeyChecking=no deploy@${{ secrets.PRODUCTION_HOST }} << 'EOF'
            cd /opt/1numbers
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER 1numbers > /backups/backup-$(date +%Y%m%d_%H%M%S).sql
          EOF
      
      - name: Run smoke tests
        run: |
          sleep 30
          curl -f https://api.1numbers.com/health || exit 1
      
      - name: Notify deployment
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author
```

---

## IMPLEMENTATION CHECKLIST

### Phase 4 Milestones

- [ ] **Week 1: Mobile Foundation**
  - [ ] React Native project setup
  - [ ] Navigation structure
  - [ ] Authentication screens
  - [ ] State management (Redux)

- [ ] **Week 2: Mobile Features**
  - [ ] Calculator screen
  - [ ] Dashboard with local caching
  - [ ] Profile management
  - [ ] Compatibility analyzer

- [ ] **Week 3: Backend Scaling**
  - [ ] Nginx load balancer
  - [ ] PostgreSQL replication
  - [ ] Redis cluster
  - [ ] Database optimization

- [ ] **Week 4: Monitoring & Deploy**
  - [ ] Prometheus setup
  - [ ] Grafana dashboards
  - [ ] CI/CD pipeline
  - [ ] Production deployment

### Success Criteria

- ✅ Mobile app handles 10,000+ concurrent users
- ✅ API response time <200ms (p95)
- ✅ 99.9% uptime SLA
- ✅ Database queries <100ms
- ✅ Cache hit rate >80%
- ✅ Zero downtime deployments
- ✅ Automatic failover working

---

## NEXT PHASE: PHASE 5 - ADVANCED AI & PERSONALIZATION

With Phase 4 complete, the system will be production-ready and scalable. Phase 5 will focus on:
- Advanced machine learning recommendations
- Personalized numerology insights via LLMs
- Predictive analytics engine
- Multi-language support
- Advanced visualization engine

---

**Last Updated**: January 13, 2026  
**Status**: Ready for Phase 4 Implementation  
**Estimated Duration**: 4 weeks  
**Team Size**: 4-6 developers
