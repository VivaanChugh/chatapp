import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true }
  });
  res.json(users);
};

export const addFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { friends: { connect: { id: friendId } } }
    });
    res.json({ message: 'Friend added' });
  } catch {
    res.status(500).json({ error: 'Failed to add friend' });
  }
}; 