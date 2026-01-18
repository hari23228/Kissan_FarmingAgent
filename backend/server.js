const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { translationMiddleware } = require('./utils/translation');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Translation middleware - applies to all routes
app.use(translationMiddleware);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Kisan API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes (to be imported)
// app.use('/api/auth', require('./api/auth'));
// app.use('/api/disease', require('./api/disease'));
app.use('/api/prices', require('./api/prices'));
// app.use('/api/schemes', require('./api/schemes'));
// app.use('/api/assistant', require('./api/assistant'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌱 Kisan Backend Server running on port ${PORT}`);
});

module.exports = app;
