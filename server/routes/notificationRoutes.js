import express from 'express';
const router = express.Router();
// ফাইল পাথের শেষে অবশ্যই .js দিতে হবে
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);

export default router;