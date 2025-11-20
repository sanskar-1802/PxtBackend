// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const ctrl = require('../controllers/notificationController');
//
// router.use(protect);
// router.get('/', ctrl.getNotifications);
// router.patch('/:id/read', ctrl.markRead);
// router.post('/send', ctrl.createNotification);
//
// module.exports = router;
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

module.exports = router;

