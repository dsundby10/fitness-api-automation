# Fitness API Test Automation

A complete full-stack project demonstrating REST API design, React UI development, and comprehensive test automation with CI/CD integration.

## Project Overview

- **Backend:** Express.js REST API with CRUD operations, aggregations, validation
- **Frontend:** React dashboard with real-time stats and form management
- **Tests:** 20+ pytest test cases covering happy paths and error scenarios
- **CI/CD:** GitHub Actions automated testing pipeline

Perfect for demonstrating SDET skills: API testing, UI testing strategy, CI/CD integration, and test data management.

## Project Structure

```
fitness-api-automation/
├── server.js                    # Express.js REST API
├── package.json                 # Node dependencies
├── ui/                          # React dashboard
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── App.css             # Dashboard styling
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML entry
│   ├── vite.config.js          # Vite config
│   └── package.json
├── tests/
│   ├── conftest.py             # pytest fixtures
│   ├── api/
│   │   ├── test_users.py       # User endpoint tests
│   │   ├── test_workouts.py    # Workout CRUD tests
│   │   └── test_stats.py       # Aggregation tests
│   └── ui/ (placeholder)        # Future: Playwright UI tests
├── .github/workflows/
│   └── test.yml                # GitHub Actions CI/CD
├── README.md
└── requirements.txt
```

## Features

### API
- **REST endpoints** for user management and workout tracking
- **Input validation** (required fields, positive numbers)
- **Error handling** with appropriate HTTP status codes
- **Aggregation queries** for stats and filtering
- **In-memory database** (stateless for demo purposes)

### React UI
- **Dashboard** for managing users and workouts
- **Real-time stats** display (total workouts, calories, minutes, averages)
- **Form validation** and error handling
- **Responsive grid layout** with modern styling
- **Vite dev server** with fast hot module reloading
- **Proxy to API** (requests to `/api` forward to localhost:3000)

### Tests
- **20+ test cases** covering happy paths and error scenarios
- **pytest fixtures** for reusable test data and API client
- **Automatic API readiness check** before running tests
- **JUnit XML reporting** for CI/CD integration
- **Parameterized assertions** for data-driven testing

### CI/CD
- **Automated test runs** on push and pull requests
- **GitHub Actions workflow** with multiple jobs
- **Test result artifacts** and reports
- **Code quality checks** (JSON validation)
- **Parallel job execution** for faster feedback

## Quick Start

### Terminal 1: Start the API

```bash
cd fitness-api-automation
npm install
npm start
```

Output: `Fitness API running on http://localhost:3000`

### Terminal 2: Start the React Dashboard

```bash
cd fitness-api-automation
npm run ui:dev
```

Output: `VITE v5.0.8 ready in XXX ms ➜ Local: http://localhost:5173/`

**Open your browser:** http://localhost:5173

You'll see:
- List of users on the left
- Create user form at top
- Create workout form for selected user
- Real-time stats (total workouts, calories, minutes, averages)
- List of workouts for selected user

### Terminal 3: Run Tests

```bash
cd fitness-api-automation
pip install -r requirements.txt
npm run test:api
```

Or run all tests:

```bash
npm run test:all
```

## API Endpoints

### Users
- `POST /api/users` - Create user
  ```bash
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"name":"Alice","email":"alice@example.com"}'
  ```
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID

### Workouts
- `POST /api/workouts` - Create workout
  ```bash
  curl -X POST http://localhost:3000/api/workouts \
    -H "Content-Type: application/json" \
    -d '{
      "userId":"USER-ID",
      "type":"running",
      "duration":30,
      "calories":300
    }'
  ```
- `GET /api/workouts` - List all workouts (supports `?userId=X` filter)
- `GET /api/workouts/:id` - Get workout by ID
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Stats
- `GET /api/stats/:userId` - Get user stats
  ```bash
  curl http://localhost:3000/api/stats/USER-ID
  # Returns: {
  #   "userId": "...",
  #   "totalWorkouts": 5,
  #   "totalCalories": 1500,
  #   "totalMinutes": 150,
  #   "averageCaloriesPerWorkout": 300
  # }
  ```

### Health
- `GET /health` - API health check

## Testing Strategy

### Test Layers
1. **Smoke Tests**: Health check, basic CRUD operations
2. **Unit Tests**: Endpoint validation, error handling
3. **Integration Tests**: Multi-endpoint workflows (create user → create workout → get stats)
4. **Contract Tests**: Response schema validation (future)

### Test Data Management
- **Fixtures** create fresh test data per test
- **UUIDs** prevent test data collisions
- **In-memory database** resets between test runs
- **Isolation** — tests don't interfere with each other

### Test Categories
```python
# Happy path: successful operations
def test_create_user_success(self, api_client):
    response = api_client.post("/api/users", {...})
    assert response.status_code == 201

# Error handling: validation failures
def test_create_user_missing_name(self, api_client):
    response = api_client.post("/api/users", {"email": "..."})
    assert response.status_code == 400

# Data integrity: calculations correct
def test_stats_calculation_accuracy(self, api_client, test_user):
    # Create 3 workouts, verify aggregations
    assert data["totalWorkouts"] == 3
    assert data["totalCalories"] == 1250
```

## CI/CD Pipeline

### Workflow: `test.yml`

**Trigger:** `push` to main/develop, `pull_request`

**Jobs:**
1. **api-tests** (20+ tests in ~0.2s)
   - Install Node/Python
   - Start API server
   - Wait for readiness
   - Run pytest
   - Upload results

2. **code-quality**
   - Check for console.error/warn (code smell)
   - Validate JSON files

3. **test-report**
   - Aggregate results
   - Display summary

**Status:** All green ✅ = merge allowed

## Extending This Project

### Add UI Tests (Playwright)

```python
# tests/ui/test_dashboard.py
from playwright.sync_api import sync_playwright

def test_user_can_create_workout():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")
        
        # Fill form
        page.fill('input[placeholder="Name"]', "John")
        page.click('button:has-text("Create User")')
        
        # Verify
        assert page.is_visible('text=John')
        browser.close()
```

### Add Performance Tests

```python
def test_get_stats_performance(api_client, test_user):
    import time
    start = time.time()
    api_client.get(f"/api/stats/{test_user['id']}")
    assert (time.time() - start) < 0.5  # Must be < 500ms
```

### Add Contract Tests

```python
def test_workout_response_schema(api_client, test_user):
    response = api_client.post("/api/workouts", {...})
    data = response.json()
    
    # Validate against schema
    assert "id" in data
    assert "userId" in data
    assert "type" in data
    assert isinstance(data["duration"], int)
```

## Key SDET Concepts Demonstrated

- ✅ **Fixture-based test data** for isolation and reusability
- ✅ **API client abstraction** for maintainability
- ✅ **CI/CD integration** with GitHub Actions
- ✅ **JUnit XML reporting** for enterprise tooling
- ✅ **Error scenario coverage** (validation, 404s, state changes)
- ✅ **Idempotent tests** that can run in any order
- ✅ **Artifact collection** for trend analysis
- ✅ **Full-stack project** (backend + frontend + tests)

## Troubleshooting

**API not starting?**
```bash
lsof -i :3000  # Check what's on port 3000
kill -9 <PID>  # Kill it
npm start      # Try again
```

**React UI won't connect to API?**
- Ensure API is running on `http://localhost:3000`
- Check Vite proxy config in `ui/vite.config.js`
- Clear browser cache

**Tests timing out?**
- Increase `max_retries` in `tests/conftest.py`
- Check API logs: `npm start` should show requests

**CI/CD failing?**
- Check GitHub Actions logs in **Actions** tab
- Most common: Python/pytest not installed (already fixed in workflow)

## Contributing

1. Create a feature branch
2. Write tests first (TDD)
3. Implement the feature
4. Ensure all tests pass locally
5. Push and create a PR
6. CI/CD validates automatically

## Interview Talking Points

**"Walk me through how you'd test this:"**
- API tests are fast (feedback in seconds) → run on every commit
- UI tests are slower (interact with DOM) → run on main merges
- Tests are organized by scope for quick feedback

**"How does this demonstrate SDET skills?"**
- Built the test framework from scratch (fixtures, assertions, structure)
- Integrated tests into CI/CD (GitHub Actions workflow)
- Understood test layers (unit, integration, contract)
- Managed test data without databases (fixtures)

**"What would you add next?"**
- UI tests with Playwright (automate the dashboard)
- Performance/load tests (concurrent user simulation)
- Contract tests (API schema validation)
- Chaos injection tests (what if API is slow?)
- Test flakiness detection and quarantine

## License

MIT
