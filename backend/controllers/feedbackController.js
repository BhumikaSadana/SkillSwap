const { readData, writeData, generateId } = require('../utils/fileDB');

// POST /api/feedback/:sessionId  body: { rating: 1-5, comment }
// Sirf learner, sirf completed session par, ek baar
const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const r = Number(rating);

    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }

    const sessions = await readData('sessions');
    const session = sessions.find((s) => s.id === req.params.sessionId);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.learnerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the learner can give feedback' });
    }
    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Feedback allowed only after session is completed' });
    }

    const feedbacks = await readData('feedback');
    if (feedbacks.find((f) => f.sessionId === session.id)) {
      return res.status(409).json({ message: 'Feedback already submitted' });
    }

    const feedback = {
      id: generateId(),
      sessionId: session.id,
      teacherId: session.teacherId,
      learnerId: req.user.id,
      skill: session.skill,
      rating: r,
      comment: comment ? String(comment).trim().slice(0, 300) : '',
      createdAt: new Date().toISOString(),
    };

    feedbacks.push(feedback);
    await writeData('feedback', feedbacks);

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/feedback/teacher/:teacherId  (teacher ki ratings + average)
const getTeacherFeedback = async (req, res) => {
  try {
    const feedbacks = await readData('feedback');
    const list = feedbacks.filter((f) => f.teacherId === req.params.teacherId);
    const avg = list.length
      ? Number((list.reduce((sum, f) => sum + f.rating, 0) / list.length).toFixed(1))
      : 0;

    res.status(200).json({ count: list.length, averageRating: avg, feedback: list });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addFeedback, getTeacherFeedback };