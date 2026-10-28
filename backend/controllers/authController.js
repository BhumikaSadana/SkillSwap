const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData, generateId } = require('../utils/fileDB');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const users = await readData('users');
    const cleanEmail = email.trim().toLowerCase();

    // Duplicate check
    if (users.find((u) => u.email === cleanEmail)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: cleanEmail === process.env.ADMIN_EMAIL ? 'admin' : 'user',
      credits: 2, // starting credits taaki pehle kuch seekh sako
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeData('users', users);

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await readData('users');
    const user = users.find((u) => u.email === email.trim().toLowerCase());

    // Same message dono cases mein (security ke liye)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, credits: user.credits },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const users = await readData('users');
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...safeUser } = user; // password hata ke bhejo
    res.status(200).json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = { register, login, getMe };