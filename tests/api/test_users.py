import pytest
import requests

BASE_URL = "http://localhost:3000"

class TestUserEndpoints:
    """User CRUD operations"""
    
    def test_create_user_success(self, api_client):
        """POST /api/users should create a new user"""
        user_data = {"name": "John Doe", "email": "john@example.com"}
        response = api_client.post("/api/users", user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john@example.com"
        assert "id" in data
        assert "createdAt" in data
    
    def test_create_user_missing_name(self, api_client):
        """POST /api/users without name should fail"""
        user_data = {"email": "john@example.com"}
        response = api_client.post("/api/users", user_data)
        
        assert response.status_code == 400
        assert "Name and email required" in response.json()["error"]
    
    def test_create_user_missing_email(self, api_client):
        """POST /api/users without email should fail"""
        user_data = {"name": "John Doe"}
        response = api_client.post("/api/users", user_data)
        
        assert response.status_code == 400
        assert "Name and email required" in response.json()["error"]
    
    def test_get_all_users(self, api_client, test_user):
        """GET /api/users should return all users"""
        response = api_client.get("/api/users")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(u["id"] == test_user["id"] for u in data)
    
    def test_get_user_by_id(self, api_client, test_user):
        """GET /api/users/:id should return a specific user"""
        response = api_client.get(f"/api/users/{test_user['id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user["id"]
        assert data["name"] == test_user["name"]
    
    def test_get_nonexistent_user(self, api_client):
        """GET /api/users/:id with invalid ID should return 404"""
        response = api_client.get("/api/users/nonexistent-id")
        
        assert response.status_code == 404
        assert "User not found" in response.json()["error"]
