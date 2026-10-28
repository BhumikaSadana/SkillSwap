const { readData, writeData, generateId } = require('../utils/fileDB');
const emitter = require('../utils/events');

// POST /api/sessions/availability  (teacher slot add karta hai)
const addAvailability = async (req, res) => {
  try {
    const { skillId, date, time, meetLink } = req.body;
    if (!skillId || !date || !time || !meetLink) {
      return res.status(400).json({ message: 'skillId, date, time and meetLink are required' });
    }
    if (new Date(`${date}T${time}`) < new Date()) {
      return res.status(400).json({ message: 'Slot must be in the future' });
    }

    const skills = await readData('skills');
    const skill = skills.find(
      (s) => s.id === skillId && s.userId === req.user.id && s.type === 'teach' && s.status === 'approved'
    );
    if (!skill) {
      return res.status(403).json({ message: 'You can only add slots for your approved teach skills' });
    }

    const sessions = await readData('sessions');
    if (sessions.find((s) => s.teacherId === req.user.id && s.date === date && s.time === time)) {
      return res.status(409).json({ message: 'You already have a slot at this time' });
    }

    const slot = {
      id: generateId(),
      teacherId: req.user.id,
      learnerId: null,
      skillId,
      skill: skill.name,
      date,
      time,
      meetLink,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    sessions.push(slot);
    await writeData('sessions', sessions);

    res.status(201).json({ message: 'Slot added', slot });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/sessions/available?skill=java  (open slots, meetLink hidden)
const getAvailable = async (req, res) => {
  try {
    const { skill } = req.query;
    const users = await readData('users');
    let sessions = await readData('sessions');

    sessions = sessions.filter(
      (s) =>
        s.status === 'available' &&
        s.teacherId !== req.user.id &&
        new Date(`${s.date}T${s.time}`) > new Date()
    );
    if (skill) sessions = sessions.filter((s) => s.skill === skill.trim().toLowerCase());

    const slots = sessions.map(({ meetLink, ...s }) => {
      const t = users.find((u) => u.id === s.teacherId);
      return { ...s, teacherName: t ? t.name : 'Unknown' };
    });

    res.status(200).json({ count: slots.length, slots });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/sessions/:id/book  (learner slot book karta hai)
const bookSession = async (req, res) => {
  try {
    const sessions = await readData('sessions');
    const session = sessions.find((s) => s.id === req.params.id);

    if (!session) return res.status(404).json({ message: 'Slot not found' });
    if (session.status !== 'available') {
      return res.status(400).json({ message: 'Slot is not available' });
    }
    if (session.teacherId === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own slot' });
    }

    const users = await readData('users');
    const me = users.find((u) => u.id === req.user.id);
    if (!me || me.credits < 1) {
      return res.status(400).json({ message: 'Not enough credits. Teach a session to earn credits' });
    }

    session.learnerId = req.user.id;
    session.status = 'booked';
    session.bookedAt = new Date().toISOString();
    await writeData('sessions', sessions);

    emitter.emit('session:booked', session);
    res.status(200).json({ message: 'Session booked', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/sessions/my  (teacher + learner dono ki sessions, names ke saath)
const getMySessions = async (req, res) => {
  try {
    const sessions = await readData('sessions');
    const users = await readData('users');
    const feedbacks = await readData('feedback');
    const nameOf = (id) => (users.find((u) => u.id === id) || {}).name || null;

    const mine = sessions
      .filter((s) => s.teacherId === req.user.id || s.learnerId === req.user.id)
      .map((s) => ({
        ...s,
        teacherName: nameOf(s.teacherId),
        learnerName: nameOf(s.learnerId),
        hasFeedback: feedbacks.some((f) => f.sessionId === s.id),
      }));

    res.status(200).json({ count: mine.length, sessions: mine });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/sessions/:id/complete  (sirf teacher mark karega)
const completeSession = async (req, res) => {
  try {
    const sessions = await readData('sessions');
    const session = sessions.find((s) => s.id === req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Only the teacher can complete this session' });
    }
    if (session.status !== 'booked') {
      return res.status(400).json({ message: 'Only booked sessions can be completed' });
    }

    const users = await readData('users');
    const teacher = users.find((u) => u.id === session.teacherId);
    const learner = users.find((u) => u.id === session.learnerId);

    if (!learner || learner.credits < 1) {
      return res.status(400).json({ message: 'Learner does not have enough credits' });
    }

    learner.credits -= 1;
    teacher.credits += 1;
    session.status = 'completed';
    session.completedAt = new Date().toISOString();

    await writeData('users', users);
    await writeData('sessions', sessions);

    emitter.emit('session:completed', session);
    res.status(200).json({ message: 'Session completed, credits transferred', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addAvailability, getAvailable, bookSession, getMySessions, completeSession };