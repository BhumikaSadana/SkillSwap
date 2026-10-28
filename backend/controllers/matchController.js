const { readData } = require('../utils/fileDB');

// GET /api/match            -> mere learn skills ke hisaab se teachers
// GET /api/match?skill=java -> sirf us skill ke teachers
const getMatches = async (req, res) => {
  try {
    const { skill } = req.query;
    const skills = await readData('skills');
    const users = await readData('users');

    const mine = skills.filter((s) => s.userId === req.user.id);
    const myLearn = mine.filter((s) => s.type === 'learn').map((s) => s.name);
    const myTeach = mine
      .filter((s) => s.type === 'teach' && s.status === 'approved')
      .map((s) => s.name);

    const wanted = skill ? [skill.trim().toLowerCase()] : myLearn;

    // Dusre users ki approved teach skills jo mujhe chahiye
    const teachers = skills.filter(
      (s) =>
        s.type === 'teach' &&
        s.status === 'approved' &&
        s.userId !== req.user.id &&
        wanted.includes(s.name)
    );

    const matches = teachers.map((t) => {
      const teacher = users.find((u) => u.id === t.userId);
      // Kya wo teacher meri teach skill seekhna chahta hai?
      const teacherLearns = skills
        .filter((s) => s.userId === t.userId && s.type === 'learn')
        .map((s) => s.name);
      const mutual = teacherLearns.filter((n) => myTeach.includes(n));

      return {
        teacherId: t.userId,
        teacherName: teacher ? teacher.name : 'Unknown',
        skill: t.name,
        skillId: t.id,
        mutual: mutual.length > 0,
        mutualSkills: mutual,
      };
    });

    // Mutual matches pehle dikhao
    matches.sort((a, b) => Number(b.mutual) - Number(a.mutual));

    res.status(200).json({ count: matches.length, matches });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getMatches };