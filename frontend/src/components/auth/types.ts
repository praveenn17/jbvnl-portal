
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
  role: 'consumer' | 'admin' | 'manager' | '';
  phone: string;
  address: string;
  consumerNumber: string;
}
