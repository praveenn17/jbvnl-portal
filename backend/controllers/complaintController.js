const Complaint = require('../models/Complaint');

// --- Helpers ---
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

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
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

    // Calculate dynamic SLA status for display
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

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('lastUpdatedBy', 'name role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Security check
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

// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Private
const fileComplaint = async (req, res) => {
  const { title, description, category, priority, consumerNumber } = req.body;

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
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Assign complaint to manager/team
// @route   PATCH /api/complaints/:id/assign
// @access  Private/Admin
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
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin/Manager)
const updateComplaintStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Validate transition for managers
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
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint priority
// @route   PATCH /api/complaints/:id/priority
// @access  Private/Admin
const updateComplaintPriority = async (req, res) => {
  const { priority, note } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldPriority = complaint.priority;
    complaint.priority = priority;
    complaint.lastUpdatedBy = req.user._id;

    // Recalculate SLA
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
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a note to a complaint
// @route   POST /api/complaints/:id/notes
// @access  Private (Admin/Manager)
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
