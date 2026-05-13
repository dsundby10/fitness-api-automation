import pytest
from uuid import uuid4

class TestWorkoutEndpoints:
    """Workout CRUD operations"""
    
    def test_create_workout_success(self, api_client, test_user):
        """POST /api/workouts should create a new workout"""
        workout_data = {
            "userId": test_user["id"],
            "type": "running",
            "duration": 30,
            "calories": 300
        }
        response = api_client.post("/api/workouts", workout_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "running"
        assert data["duration"] == 30
        assert data["calories"] == 300
        assert "id" in data
    
    def test_create_workout_missing_duration(self, api_client, test_user):
        """POST /api/workouts without duration should fail"""
        workout_data = {
            "userId": test_user["id"],
            "type": "running",
            "calories": 300
        }
        response = api_client.post("/api/workouts", workout_data)
        
        assert response.status_code == 400
    
    def test_create_workout_negative_duration(self, api_client, test_user):
        """POST /api/workouts with negative duration should fail"""
        workout_data = {
            "userId": test_user["id"],
            "type": "running",
            "duration": -30,
            "calories": 300
        }
        response = api_client.post("/api/workouts", workout_data)
        
        assert response.status_code == 400
        assert "positive" in response.json()["error"].lower()
    
    def test_create_workout_negative_calories(self, api_client, test_user):
        """POST /api/workouts with negative calories should fail"""
        workout_data = {
            "userId": test_user["id"],
            "type": "running",
            "duration": 30,
            "calories": -100
        }
        response = api_client.post("/api/workouts", workout_data)
        
        assert response.status_code == 400
        assert "positive" in response.json()["error"].lower()
    
    def test_get_all_workouts(self, api_client, test_workout):
        """GET /api/workouts should return all workouts"""
        response = api_client.get("/api/workouts")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_workouts_by_user(self, api_client, test_user, test_workout):
        """GET /api/workouts?userId=X should filter by user"""
        response = api_client.get("/api/workouts", params={"userId": test_user["id"]})
        
        assert response.status_code == 200
        data = response.json()
        assert all(w["userId"] == test_user["id"] for w in data)
    
    def test_get_workout_by_id(self, api_client, test_workout):
        """GET /api/workouts/:id should return a specific workout"""
        response = api_client.get(f"/api/workouts/{test_workout['id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_workout["id"]
    
    def test_get_nonexistent_workout(self, api_client):
        """GET /api/workouts/:id with invalid ID should return 404"""
        response = api_client.get("/api/workouts/nonexistent-id")
        
        assert response.status_code == 404
    
    def test_update_workout(self, api_client, test_workout):
        """PUT /api/workouts/:id should update a workout"""
        update_data = {
            "type": "cycling",
            "duration": 45,
            "calories": 400
        }
        response = api_client.put(f"/api/workouts/{test_workout['id']}", update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "cycling"
        assert data["duration"] == 45
    
    def test_update_workout_invalid_duration(self, api_client, test_workout):
        """PUT /api/workouts/:id with negative duration should fail"""
        update_data = {"duration": -10}
        response = api_client.put(f"/api/workouts/{test_workout['id']}", update_data)
        
        assert response.status_code == 400
    
    def test_delete_workout(self, api_client, test_workout):
        """DELETE /api/workouts/:id should remove a workout"""
        response = api_client.delete(f"/api/workouts/{test_workout['id']}")
        
        assert response.status_code == 204
        
        # Verify it's gone
        get_response = api_client.get(f"/api/workouts/{test_workout['id']}")
        assert get_response.status_code == 404
