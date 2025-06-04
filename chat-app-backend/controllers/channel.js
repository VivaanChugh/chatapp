import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getChannels = async (req, res) => {
  try {
    const channels = await prisma.channel.findMany();
    res.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

export const joinChannel = async (req, res) => {
  const { channelId } = req.body;
  const userId = req.user.userId;
  try {
    await prisma.channel.update({
      where: { id: Number(channelId) },
      data: { users: { connect: { id: userId } } }
    });
    res.json({ message: 'Joined channel' });
  } catch (error) {
    console.error('Error joining channel:', error);
    res.status(500).json({ error: 'Failed to join channel' });
  }
};

export const createChannel = async (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  try {
    // Check if channel with same name exists
    const existingChannel = await prisma.channel.findUnique({
      where: { name: name.trim() }
    });

    if (existingChannel) {
      return res.status(400).json({ error: 'A channel with this name already exists' });
    }

    const channel = await prisma.channel.create({ 
      data: { 
        name: name.trim(),
        users: {
          connect: { id: req.user.userId } // Automatically add creator to channel
        }
      }
    });
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A channel with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create channel' });
    }
  }
};

export const switchChannel = async (req, res) => {
  // This can be a no-op for now, as switching is handled client-side
  res.json({ message: 'Switched channel' });
}; 