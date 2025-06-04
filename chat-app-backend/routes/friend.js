import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends
} from '../controllers/friend.js';

const router = express.Router();

router.post('/request', authenticate, sendFriendRequest);
router.get('/pending', authenticate, getPendingRequests);
router.post('/accept', authenticate, acceptFriendRequest);
router.post('/decline', authenticate, declineFriendRequest);
router.get('/list', authenticate, getFriends);

export default router; 