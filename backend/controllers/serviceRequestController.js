const ServiceRequest = require('../models/ServiceRequest');
const { logAudit } = require('../utils/auditLogger');
const notificationService = require('../utils/notificationService');

const createServiceRequest = async (req, res) => {
  const { requestType, title, description, phone, address, metadata } = req.body;

  if (!requestType || !title || !description) {
    return res.status(400).json({ message: 'Request type, title, and description are required.' });
  }

  try {
    const serviceRequest = new ServiceRequest({
      user: req.user._id,
      consumerNumber: req.user.consumerNumber || 'UNKNOWN',
      requestType,
      title,
      description,
      phone: phone || req.user.phone,
      address: address || req.user.address,
      metadata
    });

    const createdRequest = await serviceRequest.save();

    // Audit Log
    logAudit({
      action: 'SERVICE_REQUEST_CREATED',
      message: `Consumer created service request: ${requestType}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'service_request',
      targetId: createdRequest._id,
      metadata: { requestType },
      severity: 'info',
    });

    // Notify admins
    notificationService.createNotificationForRole('admin', {
      title: 'New Service Request',
      message: `${req.user.name} submitted a ${requestType} request.`,
      type: 'SERVICE_REQUEST_SUBMITTED',
      priority: 'normal',
      targetType: 'service_request',
      targetId: createdRequest._id
    });

    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found.' });
    }

    // Only allow the user or an admin/manager to view
    if (request.user.toString() !== req.user._id.toString() && req.user.role === 'consumer') {
      return res.status(403).json({ message: 'Not authorized to view this request.' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById
};
