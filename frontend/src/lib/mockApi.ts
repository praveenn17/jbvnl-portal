import { Bill, Complaint, User } from '../types';


const getApiUrl = (url: string) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  return baseURL + url;
};

const getAuthHeader = () => {
  const token = localStorage.getItem('jbvnl_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

class RealApi {
  async getBills(consumerNumber?: string): Promise<Bill[]> {
    if (!consumerNumber) return [];
    
    const response = await fetch(getApiUrl(`/api/bills/${consumerNumber}`), {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return [];
    return await response.json();
  }

  async getBillById(id: string): Promise<Bill | undefined> {
    const response = await fetch(getApiUrl(`/api/bills/detail/${id}`), {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return undefined;
    return await response.json();
  }

  async getAllBills(params?: { consumerNumber?: string; status?: string; page?: number; search?: string }): Promise<{ bills: Bill[]; total: number; pages: number }> {
    const qs = new URLSearchParams();
    if (params?.consumerNumber) qs.set('consumerNumber', params.consumerNumber);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.search) qs.set('search', params.search);
    const response = await fetch(getApiUrl(`/api/bills/all?${qs}`), { headers: { ...getAuthHeader() } });
    if (!response.ok) throw new Error('Failed to fetch bills');
    return await response.json();
  }

  async markBillPaid(billId: string, paymentMethod: string, transactionRef?: string): Promise<Bill> {
    const response = await fetch(getApiUrl(`/api/bills/${billId}/pay`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ paymentMethod, transactionRef }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to mark bill as paid');
    }
    return await response.json();
  }

  async getMeters(params?: { isSimulated?: boolean; consumerNumber?: string }): Promise<any[]> {
    const qs = new URLSearchParams();
    if (params?.isSimulated !== undefined) qs.set('isSimulated', String(params.isSimulated));
    if (params?.consumerNumber) qs.set('consumerNumber', params.consumerNumber);
    const response = await fetch(getApiUrl(`/api/meters?${qs}`), { headers: { ...getAuthHeader() } });
    if (!response.ok) return [];
    return await response.json();
  }

  async getSimulatedMeterCount(): Promise<number> {
    const response = await fetch(getApiUrl('/api/meters/simulated-count'), { headers: { ...getAuthHeader() } });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count ?? 0;
  }

  async getMyMeter(): Promise<any | null> {
    const response = await fetch(getApiUrl('/api/meters/my'), { headers: { ...getAuthHeader() } });
    if (!response.ok) return null;
    return await response.json();
  }

  async createMeter(data: { meterNumber: string; consumerNumber: string; meterType: string; previousReading?: number; currentReading?: number }): Promise<any> {
    const response = await fetch(getApiUrl('/api/meters'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to create meter');
    }
    return await response.json();
  }

  async updateMeterReading(meterId: string, currentReading: number): Promise<any> {
    const response = await fetch(getApiUrl(`/api/meters/${meterId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ currentReading }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to update reading');
    }
    return await response.json();
  }

  async deleteMeter(meterId: string): Promise<void> {
    await fetch(getApiUrl(`/api/meters/${meterId}`), { method: 'DELETE', headers: { ...getAuthHeader() } });
  }

  async getTariff(): Promise<any> {
    const response = await fetch(getApiUrl('/api/tariff'), { headers: { ...getAuthHeader() } });
    if (!response.ok) throw new Error('Failed to fetch tariff');
    return await response.json();
  }

  async updateTariff(data: { domestic?: any; commercial?: any; industrial?: any }): Promise<any> {
    const response = await fetch(getApiUrl('/api/tariff'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to update tariff');
    }
    return await response.json();
  }

  async createPaymentOrder(billId: string): Promise<any> {
    const response = await fetch(getApiUrl('/api/payments/create-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ billId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Failed to create payment order');
    }
    return await response.json();
  }

  async verifyPayment(data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; billId: string }): Promise<any> {
    const response = await fetch(getApiUrl('/api/payments/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).message || 'Payment verification failed');
    }
    return await response.json();
  }

  async getRevenueStats(): Promise<any> {
    const response = await fetch(getApiUrl('/api/stats/revenue'), { headers: { ...getAuthHeader() } });
    if (!response.ok) throw new Error('Failed to fetch revenue stats');
    return await response.json();
  }

  async getComplaints(consumerNumber?: string): Promise<Complaint[]> {
    const response = await fetch(getApiUrl('/api/complaints'), {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) return [];
    return await response.json();
  }

  async fileComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Complaint> {
    const response = await fetch(getApiUrl('/api/complaints'), {
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
    const response = await fetch(getApiUrl(`/api/complaints/${id}/status`), {
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
    const response = await fetch(getApiUrl(`/api/complaints/${id}/assign`), {
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
    const response = await fetch(getApiUrl(`/api/complaints/${id}/priority`), {
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
    const response = await fetch(getApiUrl(`/api/complaints/${id}/notes`), {
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

  async createServiceRequest(data: any): Promise<any> {
    const response = await fetch(getApiUrl('/api/service-requests'), {
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
    const response = await fetch(getApiUrl('/api/service-requests/my'), {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return [];
    return await response.json();
  }

  async getAdminSettings(): Promise<any> {
    const response = await fetch(getApiUrl('/api/settings'), {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  }

  async updateAdminSettings(data: any): Promise<any> {
    const response = await fetch(getApiUrl('/api/settings'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
  }

  async runManualBackup(): Promise<any> {
    const response = await fetch(getApiUrl('/api/settings/backup/run'), {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Backup failed');
    return await response.json();
  }

  async getManagerStats(): Promise<{ revenue: number; totalUsers: number; pendingComplaints: number }> {
    const response = await fetch(getApiUrl('/api/stats/manager'), {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) {
      return { revenue: 0, totalUsers: 0, pendingComplaints: 0 };
    }
    
    return await response.json();
  }

  async getNotifications(): Promise<any[]> {
    const response = await fetch(getApiUrl('/api/notifications'), {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return [];
    return await response.json();
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await fetch(getApiUrl('/api/notifications/unread-count'), {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  }

  async markNotificationRead(id: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/notifications/${id}/read`), {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return await response.json();
  }

  async markAllNotificationsRead(): Promise<any> {
    const response = await fetch(getApiUrl('/api/notifications/mark-all-read'), {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return await response.json();
  }

  async deleteNotification(id: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/notifications/${id}`), {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return await response.json();
  }

  async clearAllNotifications(): Promise<any> {
    const response = await fetch(getApiUrl('/api/notifications/clear-all'), {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to clear notifications');
    return await response.json();
  }

  async getDashboardStats(): Promise<any> {
    const response = await fetch(getApiUrl('/api/stats/dashboard'), {
      headers: { ...getAuthHeader() }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return await response.json();
  }

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

  async getMyProfile(): Promise<any> {
    const response = await fetch(getApiUrl('/api/auth/profile'), {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch profile');
    }
    return await response.json();
  }

  async updateMyProfile(data: { name?: string; phone?: string; address?: string }): Promise<any> {
    const response = await fetch(getApiUrl('/api/auth/profile'), {
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
    const response = await fetch(getApiUrl('/api/auth/change-password'), {
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
    const response = await fetch(getApiUrl('/api/auth/preferences'), {
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
    const response = await fetch(getApiUrl('/api/auth/deactivate'), {
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
    const response = await fetch(getApiUrl('/api/auth/delete-request'), {
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
    const response = await fetch(getApiUrl('/api/auth/logout-all'), {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to logout from all devices');
    }
    return await response.json();
  }

  async getConsumersForManager(): Promise<User[]> {
    const response = await fetch(getApiUrl('/api/auth/users/consumers'), { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch consumers');
    return await response.json();
  }

  async sendMessageToAdmin(data: any): Promise<any> {
    const response = await fetch(getApiUrl('/api/messages'), {
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
    const response = await fetch(getApiUrl('/api/messages/admin'), { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  }

  async markMessageRead(id: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/messages/${id}/read`), {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return await response.json();
  }

  async closeMessage(id: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/messages/${id}/close`), {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to close message');
    return await response.json();
  }

  async createConversation(data: { subject: string; message: string; priority?: string; category?: string }): Promise<any> {
    const response = await fetch(getApiUrl('/api/messages/conversations'), {
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
    const response = await fetch(getApiUrl('/api/messages/conversations'), { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
  }

  async getConversationById(id: string): Promise<{ conversation: any; messages: any[] }> {
    const response = await fetch(getApiUrl(`/api/messages/conversations/${id}`), { headers: getAuthHeader() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch conversation');
    }
    return await response.json();
  }

  async replyToConversation(id: string, message: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/messages/conversations/${id}/reply`), {
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
    const response = await fetch(getApiUrl(`/api/messages/conversations/${id}/read`), {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to mark conversation as read');
    return await response.json();
  }

  async closeConversation(id: string): Promise<any> {
    const response = await fetch(getApiUrl(`/api/messages/conversations/${id}/close`), {
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
    const response = await fetch(getApiUrl('/api/complaints'), { headers: getAuthHeader() });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return await response.json();
  }

  async triggerBillGeneration(): Promise<{ message: string; generated: number; skipped: number }> {
    const response = await fetch(getApiUrl('/api/bills/generate'), {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate bills');
    }
    return await response.json();
  }
}

export const mockApi = new RealApi();
