const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Temporary test route (baad mein delete kar denge)
router.get('/admin-test', protect, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin' });
});

module.exports = router;