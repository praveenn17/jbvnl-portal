const Notification = require('../models/Notification');

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
