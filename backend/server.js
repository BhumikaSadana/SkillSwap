require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchRoutes = require('./routes/matchRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitize);
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'SkillSwap API is running' });
});

const PORT = process.env.PORT || 5000;
app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});