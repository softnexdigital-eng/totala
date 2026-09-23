export interface Patient {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
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

/** Public-facing agent profile shown on the landing page. */
export interface AgentProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  photo?: string;
  averageRating?: number;
  completedTasks?: number;
  area?: string;
  services?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** A booking request submitted from the public landing page. */
export interface BookingRequest {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  patientAddress?: string;
  agentId?: string;
  agentName?: string;
  agent?: { id: string; name: string };
  serviceNeeded: string;
  preferredDate?: string;
  preferredTime?: string;
  hospital?: string;
  bookingReason?: string;
  additionalNote?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

/** Payload submitted by the Book Now modal on the landing page. */
export interface AgentBookingPayload {
  agentId?: string;
  serviceNeeded?: string;
  preferredDate?: string;
  preferredTime?: string;
  hospital?: string;
  bookingReason?: string;
  additionalNote?: string;
  patient: {
    name: string;
    phone: string;
    age: string;
    gender?: string;
    address: string;
  };
}
