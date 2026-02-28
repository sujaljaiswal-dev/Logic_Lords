const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/', (req, res) => res.json({ message: 'MindSaathi API Running' }));

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// MongoDB connection
console.log('🔄 Connecting to MongoDB...');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n⚠️ Common fixes:');
    console.error('1. Verify credentials in .env (username & password)');
    console.error('2. Check MongoDB Atlas - Allow your IP in Network Access');
    console.error('3. Make sure the cluster is active and not paused');
    console.error('4. Verify internet connection\n');
    process.exit(1);
  });
