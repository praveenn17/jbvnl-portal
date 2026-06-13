const Complaint = require('../models/Complaint');
const { logAudit } = require('../utils/auditLogger');
const notificationService = require('../utils/notificationService');
const User = require('../models/User');
const { sendComplaintStatusEmail } = require('../utils/emailService');

const getSLAHours = (priority) => {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 24;
    case 'medium': return 48;
    case 'low': return 72;
    default: return 48;
  }
};

const calculateDisplaySLA = (complaint) => {
  if (complaint.status === 'resolved' || complaint.status === 'closed') {
    return 'completed';
  }

  if (!complaint.sla || !complaint.sla.dueAt) return 'on_track';

  const now = new Date();
  const due = new Date(complaint.sla.dueAt);

  if (now > due) {
    return 'breached';
  }

  const timeRemaining = due.getTime() - now.getTime();
  const totalTime = complaint.sla.slaHours * 60 * 60 * 1000;

  if (timeRemaining < totalTime * 0.25) {
    return 'at_risk';
  }

  return 'on_track';
};

const getComplaints = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'consumer') {
      if (req.user.consumerNumber) {
        query.consumerNumber = req.user.consumerNumber;
      } else {
        return res.status(400).json({ message: 'User does not have a consumer number associated' });
      }
    } else if (req.user.role === 'manager') {
      // Managers only see complaints assigned to them (or open ones if you prefer, but strictly assigned to them as per prompt)
      query.assignedTo = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name email role')
      .populate('lastUpdatedBy', 'name role')
      .sort({ createdAt: -1 });

    const processedComplaints = complaints.map(c => {
      const doc = c.toObject();
      if (doc.sla && doc.sla.dueAt) {
        doc.sla.status = calculateDisplaySLA(doc);
      }
      return doc;
    });

    res.json(processedComplaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('lastUpdatedBy', 'name role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'consumer' && complaint.consumerNumber !== req.user.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }
    if (req.user.role === 'manager' && complaint.assignedTo && complaint.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    const doc = complaint.toObject();
    if (doc.sla && doc.sla.dueAt) {
      doc.sla.status = calculateDisplaySLA(doc);
    }

    // Consumers don't see internal admin notes
    if (req.user.role === 'consumer') {
      delete doc.adminNotes;
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fileComplaint = async (req, res) => {
  const { title, description, category, priority, consumerNumber, preferredTime, contactNumber } = req.body;

  try {
    const cNum = consumerNumber || req.user.consumerNumber;
    if (!cNum) return res.status(400).json({ message: 'Consumer number is required' });

    const complaintPriority = priority || 'medium';
    const slaHours = getSLAHours(complaintPriority);
    const dueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const complaint = new Complaint({
      consumerNumber: cNum,
      title,
      description,
      category,
      priority: complaintPriority,
      status: 'open',
      preferredTime,
      contactNumber,
      sla: {
        slaHours,
        dueAt,
        status: 'on_track'
      },
      timeline: [{
        status: 'open',
        title: 'Complaint Registered',
        message: 'Consumer filed a new complaint',
        changedByRole: req.user.role || 'consumer'
      }],
      lastUpdatedBy: req.user._id
    });

    const createdComplaint = await complaint.save();

    logAudit({
      action: 'COMPLAINT_CREATED',
      message: `Consumer created complaint: ${title}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'complaint',
      targetId: createdComplaint._id,
      targetLabel: createdComplaint.title,
      metadata: { priority: complaintPriority, category },
      severity: 'info',
    });

    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignComplaint = async (req, res) => {
  const { assignedTo, assignedTeam, note } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'assigned';
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (assignedTeam) complaint.assignedTeam = assignedTeam;
    complaint.lastUpdatedBy = req.user._id;

    if (note) {
      complaint.adminNotes.push({
        note,
        addedBy: req.user.name,
        addedByRole: req.user.role
      });
    }

    complaint.timeline.push({
      status: 'assigned',
      title: 'Complaint Assigned',
      message: `Assigned to ${assignedTeam || 'manager'}.`,
      changedByRole: req.user.role
    });

    const updatedComplaint = await complaint.save();

    logAudit({
      action: 'COMPLAINT_ASSIGNED',
      message: `Complaint assigned to ${assignedTeam || 'manager'}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'complaint',
      targetId: updatedComplaint._id,
      targetLabel: updatedComplaint.title,
      metadata: { assignedTo, assignedTeam },
      severity: 'info',
    });

    if (assignedTo) {
      notificationService.createNotificationForUser(assignedTo, {
        title: 'Complaint Assigned',
        message: `A new complaint (${updatedComplaint.title}) has been assigned to you.`,
        type: 'COMPLAINT_ASSIGNED',
        priority: 'high',
        targetType: 'complaint',
        targetId: updatedComplaint._id
      });
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'manager') {
      const allowedTransitions = {
        'assigned': ['in_progress'],
        'in_progress': ['resolved']
      };

      if (!allowedTransitions[complaint.status] || !allowedTransitions[complaint.status].includes(status)) {
        return res.status(400).json({ message: `Manager cannot transition status from ${complaint.status} to ${status}` });
      }
    } else if (req.user.role === 'consumer') {
      return res.status(403).json({ message: 'Consumers cannot update status' });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    complaint.lastUpdatedBy = req.user._id;

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      if (complaint.sla) complaint.sla.status = 'completed';
    } else if (status === 'closed') {
      complaint.closedAt = new Date();
      if (complaint.sla) complaint.sla.status = 'completed';
    }

    if (note) {
      complaint.adminNotes.push({
        note,
        addedBy: req.user.name,
        addedByRole: req.user.role
      });
    }

    complaint.timeline.push({
      status,
      title: `Status Updated: ${status}`,
      message: note || `Status changed to ${status}`,
      changedByRole: req.user.role
    });

    const updatedComplaint = await complaint.save();

    logAudit({
      action: 'COMPLAINT_STATUS_UPDATED',
      message: `Complaint status updated to ${status}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'complaint',
      targetId: updatedComplaint._id,
      targetLabel: updatedComplaint.title,
      metadata: { status, note },
      severity: status === 'resolved' ? 'info' : 'warning',
    });

    if (updatedComplaint.consumerNumber) {
      const consumer = await User.findOne({ consumerNumber: updatedComplaint.consumerNumber });
      if (consumer) {
        notificationService.createNotificationForUser(consumer._id, {
          title: 'Complaint Status Updated',
          message: `The status of your complaint (${updatedComplaint.title}) is now ${status}.`,
          type: 'COMPLAINT_STATUS_UPDATED',
          priority: 'normal',
          targetType: 'complaint',
          targetId: updatedComplaint._id
        });

        if (consumer.email) {
          sendComplaintStatusEmail(
            consumer.email,
            consumer.name || 'Consumer',
            updatedComplaint.title,
            oldStatus,
            status,
            updatedComplaint._id
          ).catch(err => console.error('[EMAIL] Complaint notification failed:', err.message));
        }
      }
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintPriority = async (req, res) => {
  const { priority, note } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldPriority = complaint.priority;
    complaint.priority = priority;
    complaint.lastUpdatedBy = req.user._id;

    const slaHours = getSLAHours(priority);
    const startFrom = complaint.createdAt || Date.now();
    const dueAt = new Date(new Date(startFrom).getTime() + slaHours * 60 * 60 * 1000);

    if (!complaint.sla) complaint.sla = {};
    complaint.sla.slaHours = slaHours;
    complaint.sla.dueAt = dueAt;

    if (note) {
      complaint.adminNotes.push({
        note,
        addedBy: req.user.name,
        addedByRole: req.user.role
      });
    }

    complaint.timeline.push({
      status: complaint.status,
      title: `Priority Escalated`,
      message: `Priority changed from ${oldPriority} to ${priority}`,
      changedByRole: req.user.role
    });

    const updatedComplaint = await complaint.save();

    logAudit({
      action: 'COMPLAINT_PRIORITY_CHANGED',
      message: `Complaint priority escalated to ${priority}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'complaint',
      targetId: updatedComplaint._id,
      targetLabel: updatedComplaint.title,
      metadata: { oldPriority, newPriority: priority },
      severity: 'warning',
    });

    if (updatedComplaint.assignedTo) {
      notificationService.createNotificationForUser(updatedComplaint.assignedTo, {
        title: 'Complaint Priority Escalated',
        message: `Priority for complaint (${updatedComplaint.title}) changed to ${priority}.`,
        type: 'COMPLAINT_PRIORITY_CHANGED',
        priority: 'urgent',
        targetType: 'complaint',
        targetId: updatedComplaint._id
      });
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComplaintNote = async (req, res) => {
  const { note } = req.body;

  if (!note) return res.status(400).json({ message: 'Note is required' });

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.adminNotes.push({
      note,
      addedBy: req.user.name,
      addedByRole: req.user.role
    });

    complaint.lastUpdatedBy = req.user._id;
    const updatedComplaint = await complaint.save();

    logAudit({
      action: 'NOTE_ADDED',
      message: `Admin/Manager added note to complaint`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'complaint',
      targetId: updatedComplaint._id,
      targetLabel: updatedComplaint.title,
      metadata: { note },
      severity: 'info',
    });

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  fileComplaint,
  assignComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  addComplaintNote
};
