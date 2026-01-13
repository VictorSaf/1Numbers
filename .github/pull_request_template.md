## Description

<!-- Briefly describe the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration/Infrastructure
- [ ] ♻️ Refactoring (no functionality change)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition/update

## Related Issues

<!-- Link to related issues using #123 syntax -->
Closes #

## Phase

<!-- What phase of development is this -->

- [ ] Phase 1: Calculator Agent & FastAPI
- [ ] Phase 2: LangGraph Orchestrator & LLM Agents
- [ ] Phase 3: MCP Servers & Advanced Features
- [ ] Maintenance/Hotfix

## Changes Made

<!-- Detailed list of changes -->

### Backend Changes
- [ ] New agent added
- [ ] API endpoint added
- [ ] Database schema modified
- [ ] Configuration updated
- [ ] Dependencies updated

### Frontend Changes
- [ ] React component added
- [ ] Hook added
- [ ] UI/UX improvement
- [ ] Styling updated

### Infrastructure
- [ ] Docker configuration updated
- [ ] Environment variables added
- [ ] Database migration created
- [ ] CI/CD pipeline modified

## Testing

### Tests Added/Updated
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added
- [ ] Manual testing completed

### Test Coverage

```
Backend: ___%
Frontend: ___%
Overall: ___%
```

### Testing Checklist
- [ ] Local testing completed (`npm run dev`)
- [ ] Docker testing completed (`docker-compose up`)
- [ ] All existing tests pass
- [ ] New tests pass
- [ ] No console errors/warnings
- [ ] Performance benchmarks met (if applicable)

## API Changes (if applicable)

### New Endpoints

```
METHOD /path
  Request: { ... }
  Response: { ... }
  Status codes: 200, 400, 500
```

### Modified Endpoints

```
METHOD /path
  Changes: ...
  Breaking: Yes/No
```

### WebSocket Events (if applicable)

```
type: "event_type"
data: { ... }
```

## Configuration Changes

### New Environment Variables

```bash
NEW_VAR=default_value  # Description
```

### Updated Dependencies

```
package-name: old_version → new_version
```

## Performance Impact

- [ ] No performance impact
- [ ] Performance improved (include metrics)
- [ ] Performance regressed (explanation + mitigation)

**Metrics:**
- Request latency: ___ ms (before) → ___ ms (after)
- Memory usage: ___ MB (before) → ___ MB (after)
- Database queries: ___ (before) → ___ (after)

## Breaking Changes

<!-- List any breaking changes and migration path -->

- [ ] No breaking changes
- [ ] Has breaking changes (explain below)

**Migration Path:**

## Screenshots/Demo (if applicable)

<!-- Add screenshots, GIFs, or video links for UI changes -->

## Deployment Notes

### Pre-deployment Checklist
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Docker image builds successfully
- [ ] Health checks passing
- [ ] Rate limiting configured (if applicable)

### Deployment Steps

```bash
# 1. ...
# 2. ...
# 3. ...
```

### Rollback Plan

In case of issues:

```bash
git revert <commit-sha>
docker-compose restart
```

## Documentation

- [ ] Updated BACKEND_SETUP.md
- [ ] Updated ARCHITECTURE.md
- [ ] Updated API documentation
- [ ] Added/updated code comments
- [ ] Updated README
- [ ] Created CHANGELOG entry

## Reviewer Checklist

### For Backend/API
- [ ] Code follows PEP 8 standards
- [ ] Type hints are complete
- [ ] Error handling is proper
- [ ] No hardcoded secrets/credentials
- [ ] Logging is appropriate
- [ ] Performance is acceptable

### For Frontend
- [ ] Code follows React best practices
- [ ] Components are properly typed (TypeScript)
- [ ] No console errors/warnings
- [ ] Responsive design verified
- [ ] Accessibility (a11y) considered
- [ ] Performance optimized (memo, useMemo, etc.)

### For Testing
- [ ] Tests are comprehensive
- [ ] Edge cases covered
- [ ] Tests are deterministic
- [ ] CI/CD pipeline passes

### For Documentation
- [ ] Changes are clearly documented
- [ ] Examples are provided
- [ ] API contracts are clear
- [ ] Migration path is documented

## Related Documentation

- [Architecture Guide](../ARCHITECTURE.md)
- [Backend Setup](../BACKEND_SETUP.md)
- [Phase Completion](../PHASE_1_COMPLETION.md)
- [Contributing Guidelines](../CONTRIBUTING.md) (coming soon)

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests passed locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Context

<!-- Add any other context about the PR here -->

---

**Reviewers:** @VictorSaf  
**Priority:** High/Medium/Low  
**Urgency:** ASAP/This sprint/Next sprint
