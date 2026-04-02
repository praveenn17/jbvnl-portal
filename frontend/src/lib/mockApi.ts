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
    
    if (!response.ok) throw new Error('Failed to file complaint');
    return await response.json();
  }

  async updateComplaintStatus(id: string, status: Complaint['status']): Promise<Complaint> {
    const response = await fetch(`/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update complaint status');
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
}

export const mockApi = new RealApi();
