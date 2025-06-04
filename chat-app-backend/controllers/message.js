import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { channelId: Number(channelId) },
      include: { 
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('Messages being sent:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  const { channelId, content } = req.body;
  const userId = req.user.userId;
  try {
    const message = await prisma.message.create({
      data: { 
        content, 
        channelId: Number(channelId), 
        userId 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}; 