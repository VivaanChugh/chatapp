import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username taken' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed }
    });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}; 