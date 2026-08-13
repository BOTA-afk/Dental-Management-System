import express from 'express';
import { getContacts, getChatHistory, sendMessageRest } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/contacts', getContacts);
router.get('/history/:otherUserId', getChatHistory);
router.post('/send', sendMessageRest);

export default router;
