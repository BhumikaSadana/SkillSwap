const express = require('express');
const {
  addAvailability, getAvailable, bookSession, getMySessions, completeSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/availability', addAvailability);
router.get('/available', getAvailable);
router.get('/my', getMySessions);
router.post('/:id/book', bookSession);
router.put('/:id/complete', completeSession);
module.exports = router;