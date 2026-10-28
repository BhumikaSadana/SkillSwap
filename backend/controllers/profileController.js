const { readData } = require('../utils/fileDB');

// GET /api/profile/:userId  (public verified profile)
const getProfile = async (req, res) => {
  try {
    const users = await readData('users');
    const user = users.find((u) => u.id === req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skills = await readData('skills');
    const sessions = await readData('sessions');
    const feedbacks = await readData('feedback');

    const verifiedSkills = skills
      .filter((s) => s.userId === user.id && s.type === 'teach' && s.status === 'approved')
      .map((s) => s.name);
    const wantsToLearn = skills
      .filter((s) => s.userId === user.id && s.type === 'learn')
      .map((s) => s.name);

    const ratings = feedbacks.filter((f) => f.teacherId === user.id);
    const avg = ratings.length
      ? Number((ratings.reduce((a, f) => a + f.rating, 0) / ratings.length).toFixed(1))
      : 0;

    res.status(200).json({
      profile: {
        id: user.id,
        name: user.name,
        verifiedSkills,
        wantsToLearn,
        sessionsTaught: sessions.filter((s) => s.teacherId === user.id && s.status === 'completed').length,
        sessionsLearned: sessions.filter((s) => s.learnerId === user.id && s.status === 'completed').length,
        averageRating: avg,
        reviews: ratings.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProfile };