const Message = require('../models/Message');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationService');

// @desc    Send Message to Admin
// @route   POST /api/messages
// @access  Private (Manager)
const sendMessage = async (req, res) => {
  try {
    const { subject, message, priority, category } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderEmail: req.user.email,
      senderRole: req.user.role,
      subject,
      message,
      priority: priority || 'medium',
      category: category || 'other',
    });

    // Notify admins (non-blocking, fire-and-forget)
    User.find({ role: 'admin' }).then(admins => {
      for (const admin of admins) {
        createNotification({
          recipient: admin._id,
          title: 'New Message from Manager',
          message: `Manager ${req.user.name} sent a message: ${subject}`,
          type: 'SYSTEM',
          priority: priority === 'urgent' ? 'high' : 'normal',
        }).catch(e => console.warn('[MSG NOTIFY]', e.message));
      }
    }).catch(e => console.warn('[MSG NOTIFY LOOKUP]', e.message));

    logAudit({
      action: 'MANAGER_MESSAGE_SENT',
      message: `Manager sent message: ${subject}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'system',
      targetId: newMessage._id,
      metadata: { subject, priority },
      severity: 'info',
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Messages
// @route   GET /api/messages/admin
// @access  Private (Admin)
const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipientRole: 'admin' }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark Message as Read
// @route   PATCH /api/messages/:id/read
// @access  Private (Admin)
const markMessageRead = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (msg.status === 'unread') {
      msg.status = 'read';
      msg.readAt = Date.now();
      await msg.save();
      
      logAudit({
        action: 'ADMIN_MESSAGE_READ',
        message: `Admin marked message as read`,
        actor: req.user._id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        targetType: 'system',
        targetId: msg._id,
        severity: 'info',
      });
    }
    
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close Message
// @route   PATCH /api/messages/:id/close
// @access  Private (Admin)
const closeMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    msg.status = 'closed';
    msg.closedAt = Date.now();
    await msg.save();

    logAudit({
      action: 'ADMIN_MESSAGE_CLOSED',
      message: `Admin closed a manager message`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'system',
      targetId: msg._id,
      severity: 'info',
    });

    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getAdminMessages,
  markMessageRead,
  closeMessage
};
