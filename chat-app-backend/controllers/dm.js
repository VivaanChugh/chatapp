import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendDM = async (req, res) => {
  const fromId = req.user.userId;
  const { toId, content } = req.body;
  try {
    const dm = await prisma.dMMessage.create({
      data: { fromId, toId, content }
    });
    res.status(201).json(dm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDMs = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.params;
  try {
    const dms = await prisma.dMMessage.findMany({
      where: {
        OR: [
          { fromId: userId, toId: Number(friendId) },
          { fromId: Number(friendId), toId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(dms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 