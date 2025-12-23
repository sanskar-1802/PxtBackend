const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);

// GET all notifications
router.get('/', ctrl.getNotifications);

// Mark as read
router.patch('/:id/read', ctrl.markRead);

// Create notification (manually from frontend)
router.post('/', ctrl.createNotification); // changed '/send' -> '/' (REST standard)

router.delete('/:id', ctrl.deleteNotification);

module.exports = router;

