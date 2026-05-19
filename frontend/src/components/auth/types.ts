
export interface LoginData {
  email: string;
  password: string;
  role: 'consumer' | 'admin' | 'manager' | '';
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'consumer' | 'manager' | ''; // 'admin' cannot self-register — use seedAdmin.js
  phone: string;
  address: string;
  consumerNumber: string;
}
