
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'admin' | 'manager';
  status: 'pending' | 'approved' | 'rejected' | 'hold';
  createdAt: string;
  consumerNumber?: string;
  phone?: string;
  address?: string;
}

export interface Consumer extends User {
  role: 'consumer';
  consumerNumber: string;
  address: string;
  phone: string;
  connectionType: string;
}

export interface Bill {
  id: string;
  consumerNumber: string;
  billNumber: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  units: number;
  createdAt: string;
}

export interface Complaint {
  _id?: string;
  id?: string;
  consumerNumber: string;
  title: string;
  description: string;
  category: 'billing' | 'power_outage' | 'connection' | 'other' | 'technical' | 'meter';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'assigned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: any; // object or string id
  assignedTeam?: string;
  adminNotes?: { note: string; addedBy: string; addedByRole: string; createdAt: string }[];
  timeline?: { status: string; title: string; message: string; changedByRole: string; createdAt: string }[];
  sla?: { slaHours: number; dueAt: string; resolvedAt?: string; status: 'on_track' | 'at_risk' | 'breached' | 'completed' };
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewConnection {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  connectionType: 'residential' | 'commercial' | 'industrial';
  loadRequired: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  message: string;
  actor?: any;
  actorName?: string;
  actorEmail?: string;
  actorRole: 'admin' | 'manager' | 'consumer' | 'system';
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  metadata?: any;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}
