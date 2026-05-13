import pytest

class TestStatsEndpoint:
    """User stats and aggregations"""
    
    def test_get_stats_with_workouts(self, api_client, test_user):
        """GET /api/stats/:userId should return aggregated stats"""
        # Create multiple workouts
        for i in range(3):
            api_client.post("/api/workouts", {
                "userId": test_user["id"],
                "type": "running",
                "duration": 30,
                "calories": 300
            })
        
        response = api_client.get(f"/api/stats/{test_user['id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["userId"] == test_user["id"]
        assert data["totalWorkouts"] == 3
        assert data["totalCalories"] == 900
        assert data["totalMinutes"] == 90
        assert data["averageCaloriesPerWorkout"] == 300
    
    def test_get_stats_no_workouts(self, api_client, test_user):
        """GET /api/stats/:userId with no workouts should return zeros"""
        response = api_client.get(f"/api/stats/{test_user['id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["totalWorkouts"] == 0
        assert data["totalCalories"] == 0
        assert data["totalMinutes"] == 0
        assert data["averageCaloriesPerWorkout"] == 0
    
    def test_stats_calculation_accuracy(self, api_client, test_user):
        """Stats calculations should be mathematically correct"""
        workouts = [
            {"userId": test_user["id"], "type": "running", "duration": 20, "calories": 200},
            {"userId": test_user["id"], "type": "cycling", "duration": 45, "calories": 450},
            {"userId": test_user["id"], "type": "swimming", "duration": 60, "calories": 600}
        ]
        
        for workout in workouts:
            api_client.post("/api/workouts", workout)
        
        response = api_client.get(f"/api/stats/{test_user['id']}")
        data = response.json()
        
        assert data["totalWorkouts"] == 3
        assert data["totalCalories"] == 1250
        assert data["totalMinutes"] == 125
        assert data["averageCaloriesPerWorkout"] == 416  # 1250 / 3 = 416.67 → 416
