import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/message.js';
const router = express.Router();

router.get('/:channelId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;
