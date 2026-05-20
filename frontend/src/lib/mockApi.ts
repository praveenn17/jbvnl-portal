import { Bill, Complaint } from '../types';

const getAuthHeader = () => {
  const token = localStorage.getItem('jbvnl_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

class RealApi {
  // Bills
  async getBills(consumerNumber?: string): Promise<Bill[]> {
    if (!consumerNumber) return [];
    
    const response = await fetch(`/api/bills/${consumerNumber}`, {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return [];
    return await response.json();
  }

  async getBillById(id: string): Promise<Bill | undefined> {
    const response = await fetch(`/api/bills/detail/${id}`, {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return undefined;
    return await response.json();
  }

  async payBill(id: string): Promise<Bill> {
    const response = await fetch(`/api/bills/pay/${id}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      }
    });
    
    if (!response.ok) throw new Error('Payment failed');
    return await response.json();
  }

  // Complaints
  async getComplaints(consumerNumber?: string): Promise<Complaint[]> {
    const response = await fetch('/api/complaints', {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return [];
    return await response.json();
  }

  async fileComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Complaint> {
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify(complaint)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to file complaint');
    }
    return await response.json();
  }

  async updateComplaintStatus(id: string, status: Complaint['status'], note?: string): Promise<Complaint> {
    const response = await fetch(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify({ status, note })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update complaint status');
    }
    return await response.json();
  }

  async assignComplaint(id: string, assignedTo: string, assignedTeam: string, note?: string): Promise<Complaint> {
    const response = await fetch(`/api/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ assignedTo, assignedTeam, note })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to assign complaint');
    }
    return await response.json();
  }

  async updateComplaintPriority(id: string, priority: string, note?: string): Promise<Complaint> {
    const response = await fetch(`/api/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ priority, note })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update priority');
    }
    return await response.json();
  }

  async addComplaintNote(id: string, note: string): Promise<Complaint> {
    const response = await fetch(`/api/complaints/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ note })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to add note');
    }
    return await response.json();
  }

  // Dashboard / Analytics Stats
  async getManagerStats(): Promise<{ revenue: number; totalUsers: number; pendingComplaints: number }> {
    const response = await fetch('/api/stats/manager', {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) {
      return { revenue: 0, totalUsers: 0, pendingComplaints: 0 };
    }
    
    return await response.json();
  }

  // Audit Logs
  async getAuditLogs(filters?: Record<string, string>): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams(filters || {}).toString();
    const url = queryParams ? `/api/audit-logs?${queryParams}` : '/api/audit-logs';
    const response = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) {
      return { logs: [], total: 0, page: 1, limit: 20 };
    }
    
    return await response.json();
  }

  // Profile & Auth
  async getMyProfile(): Promise<any> {
    const response = await fetch('/api/auth/profile', {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch profile');
    }
    return await response.json();
  }

  async updateMyProfile(data: { name?: string; phone?: string; address?: string }): Promise<any> {
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update profile');
    }
    return await response.json();
  }

  async changePassword(data: any): Promise<any> {
    const response = await fetch('/api/auth/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to change password');
    }
    return await response.json();
  }

  async logoutAllDevices(): Promise<any> {
    const response = await fetch('/api/auth/logout-all', {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to logout from all devices');
    }
    return await response.json();
  }
}

export const mockApi = new RealApi();
