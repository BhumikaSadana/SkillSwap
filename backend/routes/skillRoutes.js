const express = require('express');
const { addSkill, getMySkills } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('proof'), addSkill);
router.get('/my', protect, getMySkills);

module.exports = router;