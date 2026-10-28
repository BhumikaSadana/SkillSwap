const { readData, writeData, generateId } = require('../utils/fileDB');

// POST /api/skills  (user skill add karta hai, status = pending)
const addSkill = async (req, res) => {
  try {
    const { name, type, proofLink } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Skill name and type are required' });
    }
    if (!['teach', 'learn'].includes(type)) {
      return res.status(400).json({ message: "Type must be 'teach' or 'learn'" });
    }
    if (type === 'teach' && !req.file && !proofLink) {
      return res.status(400).json({ message: 'Proof (file or link) required to teach a skill' });
    }

    const skills = await readData('skills');
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, ' ');

    if (skills.find((s) => s.userId === req.user.id && s.name === cleanName && s.type === type)) {
      return res.status(409).json({ message: 'Skill already added' });
    }

    const skill = {
      id: generateId(),
      userId: req.user.id,
      name: cleanName,
      type,
      proofLink: proofLink || null,
      proofFile: req.file ? req.file.filename : null,
      // learn skills ko approval nahi chahiye, teach wali pending jaati hai
      status: type === 'teach' ? 'pending' : 'approved',
      createdAt: new Date().toISOString(),
    };

    skills.push(skill);
    await writeData('skills', skills);

    res.status(201).json({ message: 'Skill added', skill });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/skills/my
const getMySkills = async (req, res) => {
  try {
    const skills = await readData('skills');
    res.status(200).json({ skills: skills.filter((s) => s.userId === req.user.id) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addSkill, getMySkills };