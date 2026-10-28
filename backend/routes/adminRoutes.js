const express = require('express');
const { getSkills, updateSkillStatus, getUsers, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Is file ke saare routes sirf admin ke liye
router.use(protect, authorizeRoles('admin'));

router.get('/skills', getSkills);
router.put('/skills/:id', updateSkillStatus);
router.get('/users', getUsers);
router.get('/stats', getStats);
module.exports = router;