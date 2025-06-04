import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendDM, getDMs } from '../controllers/dm.js';

const router = express.Router();

router.post('/', authenticate, sendDM);
router.get('/:friendId', authenticate, getDMs);

export default router; 