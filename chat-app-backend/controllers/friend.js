import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const sendFriendRequest = async (req, res) => {
  const fromId = req.user.userId;
  const { toId } = req.body;
  if (fromId === toId) return res.status(400).json({ error: "Can't friend yourself" });
  try {
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ],
        status: 'pending'
      }
    });
    if (existing) return res.status(400).json({ error: 'Request already exists' });
    await prisma.friendRequest.create({
      data: { fromId, toId, status: 'pending' }
    });
    res.json({ message: 'Request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
  const userId = req.user.userId;
  const sent = await prisma.friendRequest.findMany({
    where: { fromId: userId, status: 'pending' },
    include: { to: true }
  });
  const received = await prisma.friendRequest.findMany({
    where: { toId: userId, status: 'pending' },
    include: { from: true }
  });
  res.json({ sent, received });
};

export const acceptFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const { requestId } = req.body;
  try {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.toId !== userId) return res.status(404).json({ error: 'Request not found' });
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });
    await prisma.user.update({
      where: { id: userId },
      data: { friends: { connect: { id: request.fromId } } }
    });
    await prisma.user.update({
      where: { id: request.fromId },
      data: { friends: { connect: { id: userId } } }
    });
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const declineFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const { requestId } = req.body;
  try {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.toId !== userId) return res.status(404).json({ error: 'Request not found' });
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'declined' }
    });
    res.json({ message: 'Friend request declined' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriends = async (req, res) => {
  const userId = req.user.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: { select: { id: true, username: true } } }
  });
  res.json(user.friends);
}; 