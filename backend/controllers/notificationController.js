const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { unreadOnly, page = 1, limit = 50 } = req.query;
    
    // User sees direct notifications AND notifications matching their role
    const query = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role }
      ]
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread count for logged-in user
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role }
      ],
      isRead: false
    };

    const count = await Notification.countDocuments(query);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Security: Only target user or target role can mark it read
    if (
      (notification.recipient && notification.recipient.toString() !== req.user._id.toString()) &&
      (notification.recipientRole && notification.recipientRole !== req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read for logged-in user
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role }
      ],
      isRead: false
    };

    await Notification.updateMany(query, {
      $set: { isRead: true, readAt: Date.now() }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Security: Only target user or target role can delete it
    if (
      (notification.recipient && notification.recipient.toString() !== req.user._id.toString()) &&
      (notification.recipientRole && notification.recipientRole !== req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications for logged-in user
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role }
      ]
    };

    await Notification.deleteMany(query);
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
