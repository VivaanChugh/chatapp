import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getChannels, joinChannel, createChannel, switchChannel } from '../controllers/channel.js';
const router = express.Router();

router.get('/', authenticate, getChannels);
router.post('/join', authenticate, joinChannel);
router.post('/create', authenticate, createChannel);
router.post('/switch', authenticate, switchChannel);

export default router;
