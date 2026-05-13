# Fitness API Test Automation

A complete end-to-end test automation project demonstrating REST API testing, CI/CD pipeline integration, and quality assurance practices.

## Project Structure

```
fitness-api-automation/
├── server.js                    # Express.js REST API
├── package.json                 # Node dependencies
├── tests/
│   ├── conftest.py             # pytest fixtures (API client, test data)
│   ├── api/
│   │   ├── test_users.py       # User endpoint tests
│   │   ├── test_workouts.py    # Workout CRUD tests
│   │   └── test_stats.py       # Aggregation tests
│   └── ui/ (placeholder)        # Future: Selenium/Playwright tests
├── .github/workflows/
│   └── test.yml                # GitHub Actions CI/CD pipeline
└── README.md
```

## Features

### API
- **REST endpoints** for user management and workout tracking
- **Input validation** (required fields, positive numbers)
- **Error handling** with appropriate HTTP status codes
- **Aggregation queries** for stats and filtering

### Tests
- **20+ test cases** covering happy paths and error scenarios
- **pytest fixtures** for reusable test data and API client
- **Parameterized tests** for data-driven testing
- **Automatic API readiness check** before running tests
- **JUnit XML reporting** for CI/CD integration

### CI/CD
- **Automated test runs** on push and pull requests
- **GitHub Actions workflow** with multiple jobs
- **Test result artifacts** and reports
- **Code quality checks** (JSON validation)
- **Parallel job execution** for faster feedback

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd fitness-api-automation
npm install
pip install pytest requests
```

### 2. Start the API

```bash
npm start
# API running on http://localhost:3000
```

### 3. Run Tests

```bash
# All tests
npm run test:all

# API tests only
npm run test:api

# Specific test file
pytest tests/api/test_users.py -v

# With coverage
pytest tests/ -v --cov=.
```

### 4. Monitor CI/CD

Push to GitHub and check the **Actions** tab for workflow results, test reports, and artifacts.

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID

### Workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts` - List workouts (supports `?userId=X` filter)
- `GET /api/workouts/:id` - Get workout by ID
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Stats
- `GET /api/stats/:userId` - Get user stats (total workouts, calories, minutes)

### Health
- `GET /health` - API health check

## Example Requests

### Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com"
  }'
```

### Create a Workout

```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "type": "running",
    "duration": 30,
    "calories": 300
  }'
```

### Get User Stats

```bash
curl http://localhost:3000/api/stats/user-id-here
```

## Testing Strategy

### Test Layers
1. **Unit Tests**: Endpoint validation, error handling
2. **Integration Tests**: Multi-endpoint workflows (create user → create workout → get stats)
3. **Smoke Tests**: Health check, basic CRUD operations
4. **Contract Tests**: Response schema validation (future)

### Test Data Management
- Fixtures in `conftest.py` create fresh test data per test
- In-memory database resets between test runs
- UUIDs prevent test data collisions

### CI/CD Integration
- **Fast feedback**: Tests run on every PR
- **Gated merges**: Tests must pass before merge
- **Artifact collection**: Test reports and logs
- **Trend tracking**: Historical test metrics (future)

## Extending This Project

### Add UI Tests (Selenium/Playwright)

```python
# tests/ui/test_dashboard.py
from selenium import webdriver

def test_user_can_log_workout(web_driver):
    web_driver.get("http://localhost:5173")
    # Interact with UI, verify behavior
    assert web_driver.find_element("css", ".stats").is_displayed()
```

### Add Contract Tests

```python
def test_workout_response_schema(api_client, test_user):
    response = api_client.post("/api/workouts", {...})
    assert "id" in response.json()
    assert "userId" in response.json()
    # Validate against OpenAPI schema
```

### Add Performance Tests

```python
import time
def test_get_stats_performance(api_client, test_user):
    start = time.time()
    api_client.get(f"/api/stats/{test_user['id']}")
    assert (time.time() - start) < 0.5  # Must be < 500ms
```

## Key SDET Concepts Demonstrated

- **Fixture-based test data** for isolation and reusability
- **API client abstraction** for maintainability
- **CI/CD integration** with GitHub Actions
- **JUnit XML reporting** for enterprise tooling
- **Error scenario coverage** (validation, 404s, state changes)
- **Idempotent tests** that can run in any order
- **Artifact collection** and trend analysis

## Troubleshooting

**API not starting?**
```bash
lsof -i :3000  # Check what's using port 3000
kill -9 <PID>  # Kill it
npm start      # Try again
```

**Tests timing out?**
- Increase `max_retries` in `conftest.py` `wait_for_api()` fixture
- Check API logs: `npm start` should show port 3000

**CI/CD failing?**
- Check GitHub Actions logs in the **Actions** tab
- Common issue: Python/pytest not installed in runner
  - Solution: Already handled in `.github/workflows/test.yml`

## Contributing

1. Create a feature branch
2. Write tests first (TDD)
3. Implement the feature
4. Ensure all tests pass
5. Push and create a PR

## License

MIT
