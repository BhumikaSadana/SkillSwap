const express = require('express');
const { addFeedback, getTeacherFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/teacher/:teacherId', getTeacherFeedback);
router.post('/:sessionId', addFeedback);

module.exports = router;