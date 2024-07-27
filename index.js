require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const rules = require('./routes/rules')

const uri = process.env.mongo_url;
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/rules', rules);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
console.log('MongoDB URI:', uri);