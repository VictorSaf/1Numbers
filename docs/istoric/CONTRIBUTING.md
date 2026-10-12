# Contributing to 1Numbers

**Thank you for your interest in contributing!** This document provides guidelines and instructions for contributing to the 1Numbers project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/VictorSaf/1Numbers.git
cd 1Numbers

# Create feature branch
git checkout -b feature/your-feature-name

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Or use Docker
docker-compose up -d
```

## Development Workflow

### 1. Create a Branch

```bash
# Feature
git checkout -b feature/add-comparison-agent

# Bug fix
git checkout -b fix/websocket-connection-leak

# Documentation
git checkout -b docs/update-api-reference

# Branch naming convention: {type}/{description}
# Types: feature, fix, docs, refactor, perf, test, chore
```

### 2. Make Changes

**Backend:**
- Follow PEP 8
- Add type hints
- Write tests
- Update docstrings

**Frontend:**
- Use TypeScript
- Follow React best practices
- Optimize performance (memo, useMemo)
- Test responsiveness

### 3. Testing

**Backend:**
```bash
cd backend

# Run all tests
pytest -v

# Run specific test
pytest agents/test_calculator.py -v

# With coverage
pytest --cov=agents --cov-report=html

# Type checking
mypy agents/ --ignore-missing-imports
```

**Frontend:**
```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

**Docker:**
```bash
# Validate
docker-compose config

# Build
docker-compose build

# Test
docker-compose up -d
curl http://localhost:8000/health
```

### 4. Commit Messages

**Format:** `type(scope): description`

```bash
git commit -m "feat(calculator): add karmic debt detection"
git commit -m "fix(websocket): handle disconnections gracefully"
git commit -m "docs(readme): update phase 1 completion status"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, missing semicolons, etc.)
- `refactor` - Refactoring
- `perf` - Performance improvement
- `test` - Adding/updating tests
- `chore` - Build, dependencies, tooling

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub:

1. **Title:** Clear and descriptive
2. **Description:** Use the PR template
3. **Checklist:** Complete all items
4. **Reviewers:** Request @VictorSaf

## Code Style Guide

### Python (Backend)

```python
# Type hints everywhere
def calculate_profile(
    name: str,
    day: int,
    month: int,
    year: int,
    system: NumerologySystem = NumerologySystem.PYTHAGOREAN
) -> CalculationResult:
    """Calculate numerology profile.
    
    Args:
        name: Person's full name
        day: Birth day (1-31)
        month: Birth month (1-12)
        year: Birth year (1900+)
        system: Numerology system to use
        
    Returns:
        Complete numerology profile
        
    Raises:
        ValueError: If date is invalid
    """
    # Implementation
    pass

# Use descriptive names
calculator = CalculatorAgent()
profile = await calculator.calculate_profile(...)

# Proper error handling
try:
    result = await some_operation()
except ValueError as e:
    logger.error(f"Invalid input: {e}")
    raise HTTPException(status_code=400, detail=str(e))
```

### TypeScript/React (Frontend)

```typescript
// Strong typing
interface NumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  // ...
}

// Use hooks properly
const useNumerologyCalculation = (input: CalculationInput) => {
  const [result, setResult] = useState<NumerologyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Calculation logic
  }, [input]);
  
  return { result, loading, error };
};

// Memoize expensive computations
const MemoComponent = React.memo(({ profile }: Props) => {
  return <div>{profile.lifePath}</div>;
});
```

## Phase-Based Contributions

### Phase 1: Calculator & FastAPI

**Current Focus:**
- Calculator agent improvements
- API endpoint optimization
- WebSocket reliability
- Test coverage

**Contribution Ideas:**
- [ ] Add more numerology systems (e.g., Hebrew, Vedic)
- [ ] Optimize calculation performance
- [ ] Add caching layer
- [ ] Improve error messages
- [ ] Add request logging

### Phase 2: LangGraph Orchestrator

**Coming Soon:**
- Orchestrator agent
- Interpreter agent (LLM)
- Comparison agent
- Forecast agent
- RAG integration

### Phase 3: MCP Servers

**Future:**
- MCP tool discovery
- Advanced features
- Production hardening

## Documentation

### Update These When Making Changes

1. **Code Comments** - Every complex function
2. **Docstrings** - Every public method
3. **BACKEND_SETUP.md** - API/infrastructure changes
4. **ARCHITECTURE.md** - Design changes
5. **CHANGELOG.md** - All user-facing changes (create if needed)

### Documentation Format

```python
"""Module docstring explaining purpose."""

def function_name(param1: str, param2: int) -> dict:
    """Brief one-line description.
    
    Longer description with more context.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: When something is wrong
        
    Example:
        >>> result = function_name("test", 42)
        >>> result['key']
        "value"
    """
    pass
```

## Performance Considerations

### Backend

- **Target:** < 100ms for REST, < 50ms for calculation
- **Measure:** Use execution timing in logs
- **Optimize:** Profile before changing
- **Cache:** Leverage Redis for hot data

### Frontend

- **Target:** < 3 second initial load, 60fps interactions
- **Measure:** Chrome DevTools, Lighthouse
- **Optimize:** Code split, lazy load, memoize
- **Monitor:** Web Vitals metrics

## Security Guidelines

### Never
- [ ] Commit secrets/credentials
- [ ] Use `eval()` or `exec()`
- [ ] Trust user input without validation
- [ ] Store plaintext passwords
- [ ] Expose internal error details

### Always
- [ ] Use environment variables for secrets
- [ ] Validate input with Pydantic
- [ ] Use HTTPS in production
- [ ] Hash passwords (bcrypt, argon2)
- [ ] Log securely (no sensitive data)
- [ ] Run security scans (bandit, safety)

## Testing Requirements

### Backend

**Minimum Coverage: 80%**

```bash
# Check coverage
pytest --cov=backend --cov-report=term-missing

# Generate HTML report
pytest --cov=backend --cov-report=html
open htmlcov/index.html
```

**Test Types:**
- Unit tests (isolation)
- Integration tests (with DB)
- E2E tests (full flow)

### Frontend

**Minimum Coverage: 70%**

```bash
# Check coverage
npm test -- --coverage
```

**Test Types:**
- Unit tests (components, hooks)
- Integration tests (user flows)
- Snapshot tests (UI stability)

## CI/CD Pipeline

### Automated Checks

When you push, GitHub Actions will:

1. ✅ Run unit tests
2. ✅ Check code style
3. ✅ Type check (mypy)
4. ✅ Build Docker image
5. ✅ Validate docker-compose
6. ✅ Upload coverage

**All must pass** before merging.

### Local Pre-commit

```bash
# Install pre-commit
pip install pre-commit
cd 1Numbers
pre-commit install

# Now tests run before each commit
git commit -m "..."
```

## PR Review Process

### What to Expect

1. **Automated checks** - GitHub Actions
2. **Code review** - Constructive feedback
3. **Requested changes** - Make updates
4. **Approval** - From maintainers
5. **Merge** - Squash to main

### Review Criteria

- Code quality and style
- Test coverage
- Documentation
- Performance impact
- Security implications
- Breaking changes

## Release Process

### Version Format

**Semantic Versioning:** `MAJOR.MINOR.PATCH`

- `1.0.0` - Initial release
- `1.1.0` - New feature (Phase 2)
- `1.1.1` - Bug fix
- `2.0.0` - Breaking changes

### Changelog

Maintain `CHANGELOG.md`:

```markdown
## [1.1.0] - 2026-02-01

### Added
- Orchestrator agent (LangGraph)
- Interpreter agent (LLM integration)

### Fixed
- WebSocket connection leak

### Changed
- Updated dependencies

### Removed
- Deprecated endpoints
```

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Create an Issue with `bug` label
- **Features:** Create an Issue with `enhancement` label
- **Documentation:** Create an Issue with `docs` label
- **Direct Help:** Mention @VictorSaf in issues/PRs

## Resources

- [Architecture Guide](ARCHITECTURE.md)
- [Backend Setup](BACKEND_SETUP.md)
- [Phase 1 Completion](PHASE_1_COMPLETION.md)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)

## Recognition

We appreciate contributions! Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in project README

## Questions?

Don't hesitate to ask! Open an issue or discussion.

---

**Thank you for making 1Numbers better! 🙋**
