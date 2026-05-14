import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3000';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newWorkoutType, setNewWorkoutType] = useState('running');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState('30');
  const [newWorkoutCalories, setNewWorkoutCalories] = useState('300');

  // Load all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load workouts and stats when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchWorkouts(selectedUser.id);
      fetchStats(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users`);
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/workouts?userId=${userId}`);
      const data = await response.json();
      setWorkouts(data);
    } catch (err) {
      setError('Failed to fetch workouts');
      console.error(err);
    }
  };

  const fetchStats = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/stats/${userId}`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch stats');
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      setError('Name and email required');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail })
      });
      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user]);
        setNewUserName('');
        setNewUserEmail('');
        setError('');
      } else {
        setError('Failed to create user');
      }
    } catch (err) {
      setError('Error creating user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          type: newWorkoutType,
          duration: parseInt(newWorkoutDuration),
          calories: parseInt(newWorkoutCalories)
        })
      });
      if (response.ok) {
        fetchWorkouts(selectedUser.id);
        fetchStats(selectedUser.id);
        setNewWorkoutType('running');
        setNewWorkoutDuration('30');
        setNewWorkoutCalories('300');
        setError('');
      } else {
        setError('Failed to create workout');
      }
    } catch (err) {
      setError('Error creating workout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/workouts/${workoutId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setWorkouts(workouts.filter(w => w.id !== workoutId));
        if (selectedUser) {
          fetchStats(selectedUser.id);
        }
      } else {
        setError('Failed to delete workout');
      }
    } catch (err) {
      setError('Error deleting workout');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>💪 Fitness Tracker</h1>
        <p>REST API with React UI + Test Automation</p>
      </header>

      <div className="container">
        {error && <div className="error-banner">{error}</div>}

        <div className="two-column">
          {/* Left: Users Management */}
          <section className="panel">
            <h2>Users</h2>
            <form onSubmit={handleCreateUser} className="form">
              <input
                type="text"
                placeholder="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>

            <div className="user-list">
              {users.length === 0 ? (
                <p className="empty">No users yet. Create one!</p>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    className={`user-card ${selectedUser?.id === user.id ? 'active' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right: Workouts & Stats */}
          <section className="panel">
            {selectedUser ? (
              <>
                <h2>Workouts: {selectedUser.name}</h2>

                <form onSubmit={handleCreateWorkout} className="form">
                  <select value={newWorkoutType} onChange={(e) => setNewWorkoutType(e.target.value)}>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="gym">Gym</option>
                    <option value="yoga">Yoga</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={newWorkoutDuration}
                    onChange={(e) => setNewWorkoutDuration(e.target.value)}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={newWorkoutCalories}
                    onChange={(e) => setNewWorkoutCalories(e.target.value)}
                    min="1"
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Workout'}
                  </button>
                </form>

                {stats && (
                  <div className="stats-box">
                    <div className="stat">
                      <span className="stat-label">Total Workouts</span>
                      <span className="stat-value">{stats.totalWorkouts}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Minutes</span>
                      <span className="stat-value">{stats.totalMinutes}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Calories</span>
                      <span className="stat-value">{stats.totalCalories}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Avg Cal/Workout</span>
                      <span className="stat-value">{stats.averageCaloriesPerWorkout}</span>
                    </div>
                  </div>
                )}

                <div className="workout-list">
                  {workouts.length === 0 ? (
                    <p className="empty">No workouts yet. Add one!</p>
                  ) : (
                    workouts.map(workout => (
                      <div key={workout.id} className="workout-card">
                        <div className="workout-info">
                          <strong>{workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</strong>
                          <span>{workout.duration} min · {workout.calories} cal</span>
                          <small>{new Date(workout.date).toLocaleDateString()}</small>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="empty">Select a user to view workouts</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
