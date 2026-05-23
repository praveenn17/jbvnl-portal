import { Bill, Complaint, User } from '../types';

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

  // Service Requests
  async createServiceRequest(data: any): Promise<any> {
    const response = await fetch('/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create service request');
    }
    return await response.json();
  }

  async getMyServiceRequests(): Promise<any[]> {
    const response = await fetch('/api/service-requests/my', {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return [];
    return await response.json();
  }

  // Settings
  async getAdminSettings(): Promise<any> {
    const response = await fetch('/api/settings', {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  }

  async updateAdminSettings(data: any): Promise<any> {
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
  }

  async runManualBackup(): Promise<any> {
    const response = await fetch('/api/settings/backup/run', {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Backup failed');
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

  // Notifications
  async getNotifications(): Promise<any[]> {
    const response = await fetch('/api/notifications', {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return [];
    return await response.json();
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await fetch('/api/notifications/unread-count', {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  }

  async markNotificationRead(id: string): Promise<any> {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return await response.json();
  }

  async markAllNotificationsRead(): Promise<any> {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return await response.json();
  }

  async deleteNotification(id: string): Promise<any> {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return await response.json();
  }

  async clearAllNotifications(): Promise<any> {
    const response = await fetch('/api/notifications/clear-all', {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to clear notifications');
    return await response.json();
  }

  async getDashboardStats(): Promise<any> {
    const response = await fetch('/api/stats/dashboard', {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
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

  async updateConsumerPreferences(data: any): Promise<any> {
    const response = await fetch('/api/auth/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update preferences');
    }
    return await response.json();
  }

  async requestDeactivateAccount(): Promise<any> {
    const response = await fetch('/api/auth/deactivate', {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to request account deactivation');
    }
    return await response.json();
  }

  async requestDeleteAccount(): Promise<any> {
    const response = await fetch('/api/auth/delete-request', {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to request account deletion');
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

  // ── New Methods for Manager & Admin Messages ──────────────────────────────
  async getConsumersForManager(): Promise<User[]> {
    const response = await fetch('/api/auth/users/consumers', { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch consumers');
    return await response.json();
  }

  async sendMessageToAdmin(data: any): Promise<any> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send message');
    }
    return await response.json();
  }

  async getAdminMessages(): Promise<any[]> {
    const response = await fetch('/api/messages/admin', { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  }

  async markMessageRead(id: string): Promise<any> {
    const response = await fetch(`/api/messages/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return await response.json();
  }

  async closeMessage(id: string): Promise<any> {
    const response = await fetch(`/api/messages/${id}/close`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to close message');
    return await response.json();
  }

  // ── Two-Way Conversation System ────────────────────────────────────────
  async createConversation(data: { subject: string; message: string; priority?: string; category?: string }): Promise<any> {
    const response = await fetch('/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create conversation');
    }
    return await response.json();
  }

  async getConversations(): Promise<any[]> {
    const response = await fetch('/api/messages/conversations', { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
  }

  async getConversationById(id: string): Promise<{ conversation: any; messages: any[] }> {
    const response = await fetch(`/api/messages/conversations/${id}`, { headers: getAuthHeader() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch conversation');
    }
    return await response.json();
  }

  async replyToConversation(id: string, message: string): Promise<any> {
    const response = await fetch(`/api/messages/conversations/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send reply');
    }
    return await response.json();
  }

  async markConversationRead(id: string): Promise<any> {
    const response = await fetch(`/api/messages/conversations/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to mark conversation as read');
    return await response.json();
  }

  async closeConversation(id: string): Promise<any> {
    const response = await fetch(`/api/messages/conversations/${id}/close`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to close conversation');
    }
    return await response.json();
  }

  async getManagerComplaints(): Promise<Complaint[]> {
    // Falls back to getComplaints which already gets manager complaints in the backend stats/complaints flow.
    // Let's assume there is /api/complaints/manager or /api/complaints for manager
    const response = await fetch('/api/complaints', { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return await response.json();
  }
}

export const mockApi = new RealApi();
