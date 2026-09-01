require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Password Reset Flow API.' });
});

// API Routes
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n\x1b[32m[Server] Server is running on port ${PORT}\x1b[0m`);
  console.log(`\x1b[36m[Server] API base url: http://localhost:${PORT}/api\x1b[0m\n`);
});
