const Bill      = require('../models/Bill');
const User      = require('../models/User');
const Complaint = require('../models/Complaint');

const getRevenueStats = async (req, res) => {
  try {
    const now   = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [paidBills, pendingBills, overdueBills, allBills] = await Promise.all([
      Bill.find({ status: 'paid' }),
      Bill.find({ status: 'pending' }),
      Bill.find({ status: 'overdue' }),
      Bill.find({}),
    ]);

    const totalRevenue    = paidBills.reduce((s, b) => s + (b.amount || 0), 0);
    const pendingRevenue  = pendingBills.reduce((s, b) => s + (b.amount || 0), 0);
    const overdueRevenue  = overdueBills.reduce((s, b) => s + (b.amount || 0), 0);
    const totalUnits      = allBills.reduce((s, b) => s + (b.unitsConsumed ?? b.units ?? 0), 0);
    const avgBillAmount   = allBills.length > 0 ? Math.round(allBills.reduce((s, b) => s + (b.amount || 0), 0) / allBills.length) : 0;
    const collectionRate  = allBills.length > 0 ? parseFloat(((paidBills.length / allBills.length) * 100).toFixed(1)) : 0;

    // Yearly revenue (bills created this calendar year)
    const yearlyBills   = paidBills.filter(b => new Date(b.createdAt) >= yearStart);
    const yearlyRevenue = yearlyBills.reduce((s, b) => s + (b.amount || 0), 0);

    // Monthly breakdown — group paid bills by billingPeriod
    const monthlyMap = {};
    paidBills.forEach(b => {
      const key = b.billingPeriod || 'Unknown';
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, collections: 0 };
      monthlyMap[key].revenue += b.amount || 0;
      monthlyMap[key].collections++;
    });
    const monthlyBreakdown = Object.entries(monthlyMap).map(([month, data]) => ({
      month, ...data,
    }));

    res.json({
      totalRevenue,
      yearlyRevenue,
      monthlyRevenue: totalRevenue,   // alias
      pendingRevenue,
      overdueRevenue,
      collectionRate,
      paidBillsCount:    paidBills.length,
      pendingBillsCount: pendingBills.length,
      overdueBillsCount: overdueBills.length,
      totalBillsCount:   allBills.length,
      totalUnitsConsumed: totalUnits,
      avgBillAmount,
      monthlyBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getManagerStats = async (req, res) => {
  try {
    const [bills, totalUsers, pendingComplaints] = await Promise.all([
      Bill.find({}),
      User.countDocuments({ role: 'consumer' }),
      Complaint.countDocuments({ status: { $nin: ['resolved', 'closed'] } }),
    ]);

    const paid     = bills.filter(b => b.status === 'paid');
    const pending  = bills.filter(b => b.status === 'pending');
    const overdue  = bills.filter(b => b.status === 'overdue');
    const revenue  = paid.reduce((s, b) => s + b.amount, 0);
    const rate     = bills.length > 0 ? parseFloat(((paid.length / bills.length) * 100).toFixed(1)) : 0;

    res.json({ revenue, totalUsers, pendingComplaints, paidBills: paid.length, pendingBills: pending.length, overdueBills: overdue.length, collectionRate: rate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    let stats  = {};

    if (role === 'admin') {
      const [allBills, totalUsers, activeComplaints, pendingApprovals] = await Promise.all([
        Bill.find({}),
        User.countDocuments({ role: 'consumer' }),
        Complaint.countDocuments({ status: { $nin: ['resolved', 'closed'] } }),
        User.countDocuments({ status: 'pending' }),
      ]);

      const paid   = allBills.filter(b => b.status === 'paid');
      const revenue = paid.reduce((s, b) => s + b.amount, 0);
      const rate    = allBills.length > 0 ? parseFloat(((paid.length / allBills.length) * 100).toFixed(1)) : 0;

      // Real monthly revenue from billingPeriod grouping
      const monthlyMap = {};
      paid.forEach(b => {
        const key = (b.billingPeriod || 'Unknown').substring(0, 3); // e.g. "Jan"
        if (!monthlyMap[key]) monthlyMap[key] = 0;
        monthlyMap[key] += b.amount;
      });
      const monthlyRevenue = Object.entries(monthlyMap).map(([month, rev]) => ({
        month,
        revenue: parseFloat((rev / 100000).toFixed(2)),
      }));

      // Complaints by category
      const categories   = ['Power Outage', 'Billing', 'Technical', 'New Connection'];
      const colorMap     = { 'Power Outage': '#ef4444', 'Billing': '#f59e0b', 'Technical': '#3b82f6', 'New Connection': '#22c55e' };
      const complaintsByCategory = await Promise.all(categories.map(async cat => ({
        name: cat,
        value: await Complaint.countDocuments({ category: cat, status: { $nin: ['resolved', 'closed'] } }),
        color: colorMap[cat],
      })));

      stats = {
        revenue, totalUsers, activeComplaints, pendingApprovals,
        monthlyRevenue, complaintsByCategory, collectionRate: rate,
        paidBillsCount: paid.length, totalBillsCount: allBills.length,
      };

    } else if (role === 'manager') {
      const [assignedComplaints, inProgressComplaints, resolvedComplaints, urgentComplaints] = await Promise.all([
        Complaint.countDocuments({ assignedTo: req.user._id }),
        Complaint.countDocuments({ assignedTo: req.user._id, status: 'in_progress' }),
        Complaint.countDocuments({ assignedTo: req.user._id, status: 'resolved' }),
        Complaint.countDocuments({ assignedTo: req.user._id, priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
      ]);
      stats = { assignedComplaints, inProgressComplaints, resolvedComplaints, urgentComplaints };

    } else if (role === 'consumer') {
      const [myComplaints, openComplaints, resolvedComplaints, bills] = await Promise.all([
        Complaint.countDocuments({ consumerNumber: req.user.consumerNumber }),
        Complaint.countDocuments({ consumerNumber: req.user.consumerNumber, status: { $nin: ['resolved', 'closed'] } }),
        Complaint.countDocuments({ consumerNumber: req.user.consumerNumber, status: 'resolved' }),
        Bill.find({ consumerNumber: req.user.consumerNumber }).sort({ dueDate: -1 }),
      ]);

      const latestBill      = bills[0] || null;
      const hasPendingBills = bills.some(b => b.status === 'pending' || b.status === 'overdue');
      stats = {
        myComplaints, openComplaints, resolvedComplaints, activeComplaints: openComplaints,
        currentBillAmount: latestBill?.amount || 0,
        unitsConsumed:     latestBill?.unitsConsumed ?? latestBill?.units ?? 0,
        paymentStatus:     hasPendingBills ? 'Pending' : (bills.length > 0 ? 'Up to Date' : 'No Data'),
        latestBillStatus:  latestBill?.status || null,
      };
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRevenueStats, getManagerStats, getDashboardStats };
