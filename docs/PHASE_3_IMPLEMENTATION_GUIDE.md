# Phase 3: Frontend Implementation Guide
## Step-by-Step Development Workflow

---

## 📋 TABLE OF CONTENTS

1. [Project Setup](#project-setup)
2. [Week 1: Foundation](#week-1-foundation)
3. [Week 2: Core Features](#week-2-core-features)
4. [Week 3: Advanced Features](#week-3-advanced-features)
5. [Week 4: Polish & Testing](#week-4-polish--testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🛠️ PROJECT SETUP

### Initial Setup

```bash
# Clone repository
git clone https://github.com/VictorSaf/1Numbers.git
cd 1Numbers

# Switch to Phase 3 branch
git checkout phase-3/frontend-integration

# Create frontend directory
mkdir -p frontend
cd frontend

# Initialize Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install @reduxjs/toolkit react-redux recharts axios socket.io-client
npm install -D typescript @types/react @types/react-dom tailwindcss postcss autoprefixer
npm install -D @testing-library/react @testing-library/jest-dom jest
npm install -D cypress @storybook/react @storybook/addon-essentials
```

### Environment Configuration

**`.env.local`** (Development)
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_AUTH_PROVIDER=google
VITE_ENABLE_MOCK_API=false
```

**`.env.staging`** (Staging)
```bash
VITE_API_URL=https://staging-api.1numbers.dev
VITE_WS_URL=wss://staging-api.1numbers.dev
VITE_AUTH_PROVIDER=google
VITE_ENABLE_MOCK_API=false
```

**`.env.production`** (Production)
```bash
VITE_API_URL=https://api.1numbers.dev
VITE_WS_URL=wss://api.1numbers.dev
VITE_AUTH_PROVIDER=google
VITE_ENABLE_MOCK_API=false
```

### Project Structure Creation

```bash
# Create folder structure
mkdir -p src/{components,pages,store,hooks,services,types,utils,styles}
mkdir -p tests/{unit,integration,e2e}
mkdir -p public
mkdir -p .storybook

# Create core files
touch src/App.tsx src/index.tsx src/App.css
touch .storybook/main.js .storybook/preview.js
touch tsconfig.json vite.config.ts package.json
```

---

## 📅 WEEK 1: FOUNDATION

### Day 1-2: Project Setup & Configuration

**Tasks:**
- [ ] Initialize Vite + React + TypeScript
- [ ] Configure ESLint & Prettier
- [ ] Setup Tailwind CSS
- [ ] Configure TypeScript paths
- [ ] Setup Redux store structure
- [ ] Configure environment variables

**Commits:**
```bash
git commit -m "feat: initialize vite + react + typescript setup"
git commit -m "chore: configure tailwind css and eslint"
git commit -m "chore: setup redux store with initial slices"
```

### Day 3-4: Design System & Components

**Create Global Styles:**

**`src/styles/globals.css`**
```css
:root {
  --color-primary: #208f8d;
  --color-primary-light: #2ba9a7;
  --color-primary-dark: #1a7a78;
  
  --color-bg-primary: #faf8f3;
  --color-bg-secondary: #fffcf9;
  
  --color-text-primary: #133452;
  --color-text-secondary: #626c71;
  
  --color-border: rgba(94, 82, 64, 0.2);
  --color-error: #c0152f;
  --color-success: #208f8d;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.04);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 200ms ease;
}

a:hover {
  color: var(--color-primary-dark);
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}
```

**Create Base Components:**

**`src/components/Button/Button.tsx`**
```typescript
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
};
```

**`src/components/Input/Input.tsx`**
```typescript
import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {(error || helperText) && (
        <span className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};
```

**Create Shared Components:**
- [ ] Card component
- [ ] Modal component
- [ ] Spinner component
- [ ] Toast component
- [ ] Navigation component

**Commits:**
```bash
git commit -m "feat: add global styles and design tokens"
git commit -m "feat: create base button and input components"
git commit -m "feat: create shared ui components (card, modal, spinner)"
```

### Day 5: Redux Setup

**`src/store/userSlice.ts`**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  authenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  authenticated: false,
  token: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ id: string; name: string; email: string; token: string }>) => {
      state.authenticated = true;
      state.token = action.payload.token;
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.loading = false;
    },
    loginFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.authenticated = false;
      state.token = null;
      state.id = null;
      state.name = null;
      state.email = null;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFail, logout } = userSlice.actions;
export default userSlice.reducer;
```

**`src/store/store.ts`**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import profileReducer from './profileSlice';
import researchReducer from './researchSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    profiles: profileReducer,
    research: researchReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Commits:**
```bash
git commit -m "feat: setup redux store with user, profile, research, and ui slices"
```

---

## 📅 WEEK 2: CORE FEATURES

### Day 1-2: Calculator Component

**`src/components/Calculator/Calculator.tsx`**
```typescript
import React, { useState } from 'react';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { useAppDispatch } from '../../hooks/useRedux';
import { useNumerologyAPI } from '../../hooks/useNumerologyAPI';
import styles from './Calculator.module.css';

export const Calculator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { calculate, loading } = useNumerologyAPI();
  
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: '',
    system: 'pythagorean',
  });
  
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await calculate({
        name: formData.name,
        day: parseInt(formData.day),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        system: formData.system,
      });
      
      setResults(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    }
  };
  
  return (
    <div className={styles.calculator}>
      <h1>Numerology Calculator</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
        />
        
        <div className={styles.dateGroup}>
          <Input
            label="Day"
            type="number"
            min="1"
            max="31"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            required
          />
          <Input
            label="Month"
            type="number"
            min="1"
            max="12"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            required
          />
          <Input
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
          />
        </div>
        
        <div className={styles.systemSelect}>
          <label>System</label>
          <select
            value={formData.system}
            onChange={(e) => setFormData({ ...formData, system: e.target.value })}
          >
            <option value="pythagorean">Pythagorean</option>
            <option value="chaldean">Chaldean</option>
          </select>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <Button type="submit" loading={loading}>
          Calculate Profile
        </Button>
      </form>
      
      {results && (
        <div className={styles.results}>
          <h2>Your Numerology Profile</h2>
          {/* Display results */}
        </div>
      )}
    </div>
  );
};
```

**Create API Hook:**

**`src/hooks/useNumerologyAPI.ts`**
```typescript
import { useState } from 'react';
import { api } from '../services/api';

export const useNumerologyAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculate = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/numerology/calculate', data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { calculate, loading, error };
};
```

**Commits:**
```bash
git commit -m "feat: create calculator component with form validation"
git commit -m "feat: add useNumerologyAPI hook for backend integration"
```

### Day 3-4: Dashboard Page

**`src/pages/Dashboard.tsx`**
```typescript
import React, { useEffect } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { Card } from '../components/Card/Card';
import { ProfileCard } from '../components/ProfileCard/ProfileCard';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { name } = useAppSelector((state) => state.user);
  const { profiles } = useAppSelector((state) => state.profiles);
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome back, {name}!</h1>
        <p>Your numerology dashboard</p>
      </header>
      
      <div className={styles.stats}>
        <Card title="Total Profiles">{profiles.length}</Card>
        <Card title="Recent Analysis">-</Card>
        <Card title="Compatibility Matches">-</Card>
      </div>
      
      <section className={styles.recentProfiles}>
        <h2>Recent Profiles</h2>
        <div className={styles.grid}>
          {profiles.slice(0, 6).map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>
    </div>
  );
};
```

**Commits:**
```bash
git commit -m "feat: create dashboard page with profile grid"
git commit -m "feat: add profile card component"
```

### Day 5: Pages & Routing

**`src/App.tsx`**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Calculate } from './pages/Calculate';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculate" element={<Calculate />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
```

**Commits:**
```bash
git commit -m "feat: setup react router with protected routes"
```

---

## 📅 WEEK 3: ADVANCED FEATURES

### Day 1-2: Research Explorer

**`src/pages/Research.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useNumerologyAPI } from '../hooks/useNumerologyAPI';
import { Input } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import styles from './Research.module.css';

export const Research: React.FC = () => {
  const dispatch = useAppDispatch();
  const { search, loading } = useNumerologyAPI();
  const { results } = useAppSelector((state) => state.research);
  
  const [query, setQuery] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search(query);
  };
  
  return (
    <div className={styles.research}>
      <h1>Research Explorer</h1>
      
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <Input
          placeholder="Search numerology knowledge..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Search
        </Button>
      </form>
      
      <div className={styles.results}>
        {results.map((result) => (
          <div key={result.id} className={styles.resultItem}>
            <h3>{result.title}</h3>
            <p>{result.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Commits:**
```bash
git commit -m "feat: create research explorer with search functionality"
```

### Day 3-4: WebSocket Integration

**`src/hooks/useWebSocket.ts`**
```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from './useRedux';
import { updateAgentStatus } from '../store/researchSlice';

export const useWebSocket = (url: string, userId: string) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const socket = new WebSocket(`${url}/agents/stream/${userId}`);
    
    socket.onopen = () => {
      console.log('✅ WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'phase_start':
          dispatch(updateAgentStatus('scanning'));
          break;
        case 'utility_discovered':
          // Handle utility discovery
          break;
        case 'progress_update':
          // Update progress
          break;
        case 'complete':
          dispatch(updateAgentStatus('complete'));
          break;
      }
    };
    
    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };
    
    socketRef.current = socket;
    
    return () => {
      socket.close();
    };
  }, [url, userId, dispatch]);
  
  const send = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);
  
  return { send };
};
```

**`src/components/AgentMonitor/AgentMonitor.tsx`**
```typescript
import React, { useEffect } from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import { useWebSocket } from '../../hooks/useWebSocket';
import styles from './AgentMonitor.module.css';

interface AgentMonitorProps {
  userId: string;
}

export const AgentMonitor: React.FC<AgentMonitorProps> = ({ userId }) => {
  const { send } = useWebSocket(import.meta.env.VITE_WS_URL, userId);
  const { agentStatus, agentRunning } = useAppSelector((state) => state.research);
  
  const handleStartResearch = () => {
    send({
      type: 'start_research',
      category: 'utilities',
      depth: 'medium',
    });
  };
  
  return (
    <div className={styles.monitor}>
      <h2>Autonomous Research Monitor</h2>
      
      <div className={styles.status}>
        <div className={styles.indicator}>
          <span className={`${styles.dot} ${agentRunning ? styles.active : ''}`} />
          <span>{agentRunning ? 'Running...' : 'Idle'}</span>
        </div>
      </div>
      
      <button
        onClick={handleStartResearch}
        disabled={agentRunning}
        className={styles.startButton}
      >
        {agentRunning ? 'Research in Progress' : 'Start Research'}
      </button>
    </div>
  );
};
```

**Commits:**
```bash
git commit -m "feat: add websocket integration for real-time agent streaming"
git commit -m "feat: create agent monitor component"
```

### Day 5: Visualizations

**`src/components/Charts/CompatibilityHeatmap.tsx`**
```typescript
import React from 'react';
import { HeatMap, HeatMapCell } from 'recharts';

interface HeatmapProps {
  data: number[][];
}

export const CompatibilityHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  // Implementation with recharts
  return (
    <div style={{ width: '100%', height: 400 }}>
      {/* Heatmap visualization */}
    </div>
  );
};
```

**Commits:**
```bash
git commit -m "feat: add recharts for visualization components"
```

---

## 📅 WEEK 4: POLISH & TESTING

### Day 1-2: Unit & Integration Tests

**`tests/unit/Calculator.test.tsx`**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calculator } from '../../src/components/Calculator/Calculator';
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';

describe('Calculator', () => {
  it('renders calculator form', () => {
    render(
      <Provider store={store}>
        <Calculator />
      </Provider>
    );
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });
  
  it('validates form inputs', async () => {
    render(
      <Provider store={store}>
        <Calculator />
      </Provider>
    );
    
    const submitButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(submitButton);
    
    // Check validation
  });
  
  it('submits form with valid data', async () => {
    render(
      <Provider store={store}>
        <Calculator />
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/your numerology profile/i)).toBeInTheDocument();
    });
  });
});
```

**Commits:**
```bash
git commit -m "test: add unit tests for calculator component"
git commit -m "test: add integration tests for form submission"
```

### Day 3: E2E Testing

**`tests/e2e/calculator.cy.ts`**
```typescript
describe('Calculator E2E', () => {
  beforeEach(() => {
    cy.visit('/calculate');
  });
  
  it('should calculate numerology profile', () => {
    cy.get('input[name=name]').type('John Doe');
    cy.get('input[name=day]').type('1');
    cy.get('input[name=month]').type('1');
    cy.get('input[name=year]').type('1990');
    
    cy.contains('button', /calculate/i).click();
    
    cy.contains(/your numerology profile/i).should('be.visible');
    cy.contains(/life path:/i).should('be.visible');
  });
});
```

**Commits:**
```bash
git commit -m "test: add e2e tests with cypress"
```

### Day 4-5: Optimization & Accessibility

**Performance Optimization:**
- [ ] Code splitting with React.lazy()
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Lighthouse CI configuration

**Accessibility:**
- [ ] WCAG 2.1 AA review
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast verification

**Mobile Responsiveness:**
- [ ] Mobile device testing
- [ ] Viewport configuration
- [ ] Touch interactions
- [ ] Performance on 4G

**Commits:**
```bash
git commit -m "perf: optimize bundle size and implement code splitting"
git commit -m "a11y: ensure wcag 2.1 level aa compliance"
git commit -m "responsive: mobile-first design improvements"
```

---

## 🚀 DEPLOYMENT

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel deploy --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### GitHub Actions CI/CD

**`.github/workflows/frontend-deploy.yml`**
```yaml
name: Frontend Deploy

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Issue: API calls failing**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check environment variables
echo $VITE_API_URL

# Clear browser cache
Ctrl+Shift+Delete (Chrome)
```

**Issue: WebSocket connection failing**
```bash
# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" http://localhost:8000/health

# Check browser console for errors
Ctrl+Shift+J (Chrome)
```

**Issue: Tests failing**
```bash
# Clear Jest cache
npm run test -- --clearCache

# Run single test
npm run test -- Calculator.test.tsx

# Run with verbose output
npm run test -- --verbose
```

---

## ✅ COMPLETION CHECKLIST

- [ ] All components built and tested
- [ ] 90%+ test coverage
- [ ] Lighthouse score >90
- [ ] Mobile responsiveness verified
- [ ] WCAG 2.1 AA compliance
- [ ] WebSocket integration working
- [ ] Authentication flow complete
- [ ] Documentation updated
- [ ] Code reviewed and merged
- [ ] Deployed to production

---

**Status**: 🟢 Ready to Begin  
**Duration**: 4 weeks  
**Next Phase**: Phase 4 - Mobile App & API Scaling