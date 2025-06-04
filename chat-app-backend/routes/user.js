import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUsers, addFriend } from '../controllers/user.js';
const router = express.Router();

router.get('/', authenticate, getUsers);
router.post('/friend', authenticate, addFriend);

export default router; 