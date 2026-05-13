import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database
let workouts = [];
let users = [];

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Users endpoints
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  const user = { id: uuidv4(), name, email, createdAt: new Date() };
  users.push(user);
  res.status(201).json(user);
});

app.get('/api/users', (req, res) => {
  res.status(200).json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

// Workouts endpoints
app.post('/api/workouts', (req, res) => {
  const { userId, type, duration, calories, date } = req.body;
  if (!userId || !type || !duration || !calories) {
    return res.status(400).json({ error: 'userId, type, duration, and calories required' });
  }
  if (duration <= 0 || calories <= 0) {
    return res.status(400).json({ error: 'Duration and calories must be positive' });
  }
  const workout = {
    id: uuidv4(),
    userId,
    type,
    duration,
    calories,
    date: date || new Date().toISOString(),
    createdAt: new Date()
  };
  workouts.push(workout);
  res.status(201).json(workout);
});

app.get('/api/workouts', (req, res) => {
  const { userId } = req.query;
  let filtered = workouts;
  if (userId) {
    filtered = filtered.filter(w => w.userId === userId);
  }
  res.status(200).json(filtered);
});

app.get('/api/workouts/:id', (req, res) => {
  const workout = workouts.find(w => w.id === req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  res.status(200).json(workout);
});

app.put('/api/workouts/:id', (req, res) => {
  const workout = workouts.find(w => w.id === req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  const { type, duration, calories } = req.body;
  if (duration && duration <= 0) {
    return res.status(400).json({ error: 'Duration must be positive' });
  }
  if (calories && calories <= 0) {
    return res.status(400).json({ error: 'Calories must be positive' });
  }
  if (type) workout.type = type;
  if (duration) workout.duration = duration;
  if (calories) workout.calories = calories;
  res.status(200).json(workout);
});

app.delete('/api/workouts/:id', (req, res) => {
  const index = workouts.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  workouts.splice(index, 1);
  res.status(204).send();
});

// Stats endpoint
app.get('/api/stats/:userId', (req, res) => {
  const userWorkouts = workouts.filter(w => w.userId === req.params.userId);
  if (userWorkouts.length === 0) {
    return res.status(200).json({
      userId: req.params.userId,
      totalWorkouts: 0,
      totalCalories: 0,
      totalMinutes: 0,
      averageCaloriesPerWorkout: 0
    });
  }
  const totalCalories = userWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalMinutes = userWorkouts.reduce((sum, w) => sum + w.duration, 0);
  res.status(200).json({
    userId: req.params.userId,
    totalWorkouts: userWorkouts.length,
    totalCalories,
    totalMinutes,
    averageCaloriesPerWorkout: Math.round(totalCalories / userWorkouts.length)
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fitness API running on http://localhost:${PORT}`);
});
