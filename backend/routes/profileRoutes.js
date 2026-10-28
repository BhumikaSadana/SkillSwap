const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:userId', protect, getProfile);

module.exports = router;