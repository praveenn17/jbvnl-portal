const Notification = require('../models/Notification');

/**
 * Utility wrapper for creating notifications asynchronously without blocking the main thread.
 * Any errors are caught and logged as warnings.
 */
const notificationService = {
  createNotification: async (data) => {
    try {
      const notification = new Notification(data);
      await notification.save();
      return notification;
    } catch (error) {
      console.warn('[NOTIFICATION SERVICE WARN] Failed to create notification:', error.message);
      return null;
    }
  },

  createNotificationForRole: async (role, data) => {
    return notificationService.createNotification({
      ...data,
      recipientRole: role,
      recipient: undefined // Role-based, not specific user
    });
  },

  createNotificationForUser: async (userId, data) => {
    return notificationService.createNotification({
      ...data,
      recipient: userId
    });
  }
};

module.exports = notificationService;
