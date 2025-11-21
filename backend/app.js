const express = require('express');
const app = express();
const db = require('./models');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const publicRoutes = require('./routes/publicRoutes');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Parse JSON and URL-encoded bodies
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiLimiter);

app.use(cors());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files for the front-end (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', publicRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Sync database
db.sequelize.sync({ alter: true }).then(() => console.log('Database synced'));

module.exports = app;
