// const Notification = require('../models/Notification');
//
// exports.getNotifications = async (req, res) => {
//   const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
//   res.json(list);
// };
//
// exports.markRead = async (req, res) => {
//   await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
//   res.json({ message: 'Marked' });
// };
//
// exports.createNotification = async (req, res) => {
//   try {
//     const { message, type } = req.body;
//
//     if (!message) {
//       return res.status(400).json({ success: false, message: 'Message is required' });
//     }
//
//     const notification = await Notification.create({
//       user: req.user._id, // Automatically link to logged-in user
//       message,
//       type: type || 'info'
//     });
//
//     res.status(201).json({
//       success: true,
//       message: 'Notification created successfully',
//       data: notification
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const notification = await Notification.create({
      user: req.user._id,
      message,
      type: type || 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
