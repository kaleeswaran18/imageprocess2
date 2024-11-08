const express = require('express');
const cors = require('cors'); // Import cors
const connectDB = require('./config/db');
const cardRoutes = require('./routes/cardRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware to allow cross-origin requests from your frontend (localhost:3000)
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware
app.use(express.json());

// Routes
app.use('/api', cardRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
