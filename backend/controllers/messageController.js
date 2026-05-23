const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ConversationMessage = require('../models/ConversationMessage');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationService');

// ═══════════════════════════════════════════════════════════════════════
// LEGACY ONE-WAY MESSAGE FUNCTIONS (UNCHANGED)
// ═══════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════
// NEW TWO-WAY CONVERSATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

// @desc    Start a new conversation (Manager only)
// @route   POST /api/messages/conversations
// @access  Private (Manager)
const createConversation = async (req, res) => {
  try {
    const { subject, message, priority, category } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    // Find all admins to add as participants
    const admins = await User.find({ role: 'admin' }).select('_id');
    const adminIds = admins.map(a => a._id);
    const participants = [req.user._id, ...adminIds];

    const conversation = await Conversation.create({
      subject,
      priority: priority || 'medium',
      category: category || 'other',
      initiatedBy: req.user._id,
      initiatedByName: req.user.name,
      initiatedByEmail: req.user.email,
      participants,
      lastMessageAt: new Date(),
      lastMessagePreview: message.slice(0, 100),
    });

    await ConversationMessage.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      readBy: [req.user._id],
    });

    // Notify all admins
    for (const admin of admins) {
      createNotification({
        recipient: admin._id,
        title: 'New Conversation from Manager',
        message: `${req.user.name} started a conversation: "${subject}"`,
        type: 'SYSTEM',
        priority: priority === 'urgent' ? 'high' : 'normal',
      }).catch(e => console.warn('[CONV NOTIFY]', e.message));
    }

    logAudit({
      action: 'MANAGER_CONVERSATION_STARTED',
      message: `Manager started conversation: ${subject}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'conversation',
      targetId: conversation._id,
      targetLabel: subject,
      metadata: { subject, priority, category },
      severity: 'info',
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversations (Admin: all; Manager: own only)
// @route   GET /api/messages/conversations
// @access  Private (Admin + Manager)
const getConversations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'manager') {
      query = { initiatedBy: req.user._id };
    }
    // Admin sees all conversations
    const conversations = await Conversation.find(query).sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single conversation + all its messages
// @route   GET /api/messages/conversations/:id
// @access  Private (Admin + Manager who is a participant)
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Authorization: Manager can only see conversations they initiated
    if (req.user.role === 'manager' && String(conversation.initiatedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this conversation.' });
    }

    const messages = await ConversationMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a conversation
// @route   POST /api/messages/conversations/:id/reply
// @access  Private (Admin + Manager who is a participant)
const replyToConversation = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Manager can only reply to their own conversations
    if (req.user.role === 'manager' && String(conversation.initiatedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to reply to this conversation.' });
    }

    // Cannot reply to a closed conversation
    if (conversation.status === 'closed') {
      return res.status(400).json({ message: 'This conversation has been closed and cannot receive new replies.' });
    }

    const newMsg = await ConversationMessage.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      readBy: [req.user._id],
    });

    // Update conversation's last message info
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = message.slice(0, 100);
    if (conversation.status === 'read') conversation.status = 'open'; // reopen read conversation on new reply
    await conversation.save();

    // Send notification and audit log based on who is replying
    if (req.user.role === 'admin') {
      // Notify the manager who started the conversation
      createNotification({
        recipient: conversation.initiatedBy,
        title: 'Admin Replied to Your Conversation',
        message: `Admin replied to "${conversation.subject}": "${message.slice(0, 60)}..."`,
        type: 'SYSTEM',
        priority: 'normal',
      }).catch(e => console.warn('[CONV NOTIFY]', e.message));

      logAudit({
        action: 'ADMIN_MESSAGE_REPLIED',
        message: `Admin replied to conversation: ${conversation.subject}`,
        actor: req.user._id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        targetType: 'conversation',
        targetId: conversation._id,
        targetLabel: conversation.subject,
        severity: 'info',
      });
    } else {
      // Manager replying — notify all admins
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        createNotification({
          recipient: admin._id,
          title: 'Manager Replied in Conversation',
          message: `${req.user.name} replied to "${conversation.subject}": "${message.slice(0, 60)}..."`,
          type: 'SYSTEM',
          priority: 'normal',
        }).catch(e => console.warn('[CONV NOTIFY]', e.message));
      }

      logAudit({
        action: 'MANAGER_MESSAGE_REPLIED',
        message: `Manager replied to conversation: ${conversation.subject}`,
        actor: req.user._id,
        actorName: req.user.name,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        targetType: 'conversation',
        targetId: conversation._id,
        targetLabel: conversation.subject,
        severity: 'info',
      });
    }

    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark conversation as read (updates status + readBy on messages)
// @route   PATCH /api/messages/conversations/:id/read
// @access  Private (Admin + Manager)
const markConversationRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (conversation.status === 'open') {
      conversation.status = 'read';
      await conversation.save();
    }

    // Mark all messages in this conversation as read by this user
    await ConversationMessage.updateMany(
      { conversationId: conversation._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'Conversation marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close a conversation (Admin only)
// @route   PATCH /api/messages/conversations/:id/close
// @access  Private (Admin only)
const closeConversation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can close conversations.' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    conversation.status = 'closed';
    conversation.closedAt = new Date();
    conversation.closedBy = req.user._id;
    await conversation.save();

    // Notify the manager
    createNotification({
      recipient: conversation.initiatedBy,
      title: 'Conversation Closed',
      message: `Admin closed your conversation: "${conversation.subject}"`,
      type: 'SYSTEM',
      priority: 'normal',
    }).catch(e => console.warn('[CONV NOTIFY]', e.message));

    logAudit({
      action: 'ADMIN_CONVERSATION_CLOSED',
      message: `Admin closed conversation: ${conversation.subject}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'conversation',
      targetId: conversation._id,
      targetLabel: conversation.subject,
      severity: 'info',
    });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Legacy
  sendMessage,
  getAdminMessages,
  markMessageRead,
  closeMessage,
  // New conversation system
  createConversation,
  getConversations,
  getConversationById,
  replyToConversation,
  markConversationRead,
  closeConversation,
};




