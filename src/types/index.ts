export interface Patient {
  id: string;
  name: string;
  phone: string;
  age?: number;
  address?: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  fee: number;
  hospital?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  doctorId: string;
  agentId?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'received' | 'ongoing' | 'completed' | 'cancelled';
  serviceType: 'online' | 'package';
  serviceFee: number;
  discountPercent?: number;
  discountAmount?: number;
  packagePrice?: number;
  packageDiscount?: number;
  packageFinalPrice?: number;
  notes?: string;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
  agent?: Agent;
  package?: {
    id: string;
    name: string;
    finalPrice: number;
    discountPercent: number;
  };
}

export interface Test {
  id: string;
  appointmentId: string;
  testName: string;
  actualCost: number;
  discountPercent: number;
  finalCost: number;
  reportUrl?: string;
  prescriptionUrl?: string;
  receiptUrl?: string;
  status: 'pending' | 'done';
  uploadedAt?: string;
  createdAt: string;
  updatedAt: string;
  appointment: Appointment;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}
