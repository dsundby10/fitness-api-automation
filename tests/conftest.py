import pytest
import requests
import json
from uuid import uuid4

BASE_URL = "http://localhost:3000"

@pytest.fixture
def api_client():
    """Simple HTTP client wrapper"""
    class APIClient:
        def __init__(self, base_url):
            self.base_url = base_url
        
        def post(self, endpoint, data):
            return requests.post(f"{self.base_url}{endpoint}", json=data)
        
        def get(self, endpoint, params=None):
            return requests.get(f"{self.base_url}{endpoint}", params=params)
        
        def put(self, endpoint, data):
            return requests.put(f"{self.base_url}{endpoint}", json=data)
        
        def delete(self, endpoint):
            return requests.delete(f"{self.base_url}{endpoint}")
    
    return APIClient(BASE_URL)

@pytest.fixture
def test_user(api_client):
    """Create a test user and return its ID"""
    user_data = {
        "name": f"Test User {uuid4().hex[:8]}",
        "email": f"test-{uuid4().hex[:8]}@example.com"
    }
    response = api_client.post("/api/users", user_data)
    assert response.status_code == 201
    return response.json()

@pytest.fixture
def test_workout(api_client, test_user):
    """Create a test workout for a user"""
    workout_data = {
        "userId": test_user["id"],
        "type": "running",
        "duration": 30,
        "calories": 300
    }
    response = api_client.post("/api/workouts", workout_data)
    assert response.status_code == 201
    return response.json()

@pytest.fixture(autouse=True)
def wait_for_api():
    """Ensure API is running before tests"""
    import time
    max_retries = 10
    for i in range(max_retries):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                return
        except requests.exceptions.RequestException:
            if i < max_retries - 1:
                time.sleep(0.5)
            else:
                raise Exception("API not running on http://localhost:3000")
