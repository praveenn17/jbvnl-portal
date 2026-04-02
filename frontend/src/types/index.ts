
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
  id: string;
  consumerNumber: string;
  title: string;
  description: string;
  category: 'billing' | 'power_outage' | 'connection' | 'other' | 'technical' | 'meter';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'assigned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
