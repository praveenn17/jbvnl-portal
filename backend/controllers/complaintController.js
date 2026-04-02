const Complaint = require('../models/Complaint');

// @desc    Get all complaints (Admin/Manager sees all, Consumer sees their own)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};
    
    // If user is consumer, only show their complaints
    if (req.user.role === 'consumer') {
      // Note: We'll assume the consumerNumber is stored on the user object from Phase 2
      if (req.user.consumerNumber) {
        query.consumerNumber = req.user.consumerNumber;
      } else {
        return res.status(400).json({ message: 'User does not have a consumer number associated' });
      }
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
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
    
    if (!cNum) {
      return res.status(400).json({ message: 'Consumer number is required' });
    }

    const complaint = new Complaint({
      consumerNumber: cNum,
      title,
      description,
      category,
      priority: priority || 'medium',
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.status = status || complaint.status;
      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComplaints,
  fileComplaint,
  updateComplaintStatus,
};
