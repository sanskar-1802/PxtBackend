
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

    if (!message)
      return res.status(400).json({ success: false, message: "Message is required" });

    // 🛑 Check for duplicate
    const alreadyExists = await checkDuplicate(req.user._id, message, type || "info");
    if (alreadyExists) {
      return res.status(200).json({
        success: false,
        message: "Duplicate notification suppressed",
      });
    }

    const notification = await Notification.create({
      user: req.user._id,
      message,
      type: type || "info",
    });

    res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({ success: true, message: "Notification deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

