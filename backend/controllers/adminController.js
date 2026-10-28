const { readData, writeData } = require('../utils/fileDB');

// GET /api/admin/skills?status=pending
const getSkills = async (req, res) => {
  try {
    const { status } = req.query;
    let skills = await readData('skills');
    skills = skills.filter((s) => s.type === 'teach');
    if (status) skills = skills.filter((s) => s.status === status);

    // Har skill ke saath user ka naam bhi bhejo
    const users = await readData('users');
    const result = skills.map((s) => {
      const u = users.find((x) => x.id === s.userId);
      return { ...s, userName: u ? u.name : 'Unknown', userEmail: u ? u.email : '' };
    });

    res.status(200).json({ skills: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/skills/:id  body: { status: "approved" | "rejected" }
const updateSkillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const skills = await readData('skills');
    const skill = skills.find((s) => s.id === req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    skill.status = status;
    skill.reviewedAt = new Date().toISOString();
    await writeData('skills', skills);

    res.status(200).json({ message: `Skill ${status}`, skill });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await readData('users');
    const safe = users.map(({ password, ...u }) => u);
    res.status(200).json({ count: safe.length, users: safe });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const users = await readData('users');
    const skills = await readData('skills');
    const sessions = await readData('sessions');

    res.status(200).json({
      totalUsers: users.length,
      pendingSkills: skills.filter((s) => s.type === 'teach' && s.status === 'pending').length,
      approvedSkills: skills.filter((s) => s.type === 'teach' && s.status === 'approved').length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s) => s.status === 'completed').length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getSkills, updateSkillStatus, getUsers, getStats };