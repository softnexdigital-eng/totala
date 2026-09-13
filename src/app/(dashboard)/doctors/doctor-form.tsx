'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Doctor {
  id: string;
  name: string;
  profileUrl?: string;
  imageUrl?: string;
  designation?: string;
  specialty?: string;
  qualifications?: string;
  hospital?: string;
  department?: string;
  unit?: string;
  room?: string;
  consultationFee?: number;
  visitingDays?: string;
  visitingTime?: string;
  appointmentUrl?: string;
  isActive: boolean;
}

interface DoctorFormProps {
  doctor?: Doctor;
}

export default function DoctorForm({ doctor }: DoctorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    profileUrl: doctor?.profileUrl || '',
    imageUrl: doctor?.imageUrl || '',
    designation: doctor?.designation || '',
    specialty: doctor?.specialty || '',
    qualifications: doctor?.qualifications || '',
    hospital: doctor?.hospital || '',
    department: doctor?.department || '',
    unit: doctor?.unit || '',
    room: doctor?.room || '',
    consultationFee: doctor?.consultationFee?.toString() || '',
    visitingDays: doctor?.visitingDays || '',
    visitingTime: doctor?.visitingTime || '',
    appointmentUrl: doctor?.appointmentUrl || '',
    isActive: doctor?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors';
      const method = doctor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(doctor ? 'Doctor updated!' : 'Doctor created!');
        router.push('/doctors');
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Designation
        </label>
        <input
          type="text"
          value={formData.designation}
          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Specialty
        </label>
        <input
          type="text"
          value={formData.specialty}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualifications
        </label>
        <input
          type="text"
          value={formData.qualifications}
          onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hospital
        </label>
        <input
          type="text"
          value={formData.hospital}
          onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          type="text"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit
        </label>
        <input
          type="text"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room
        </label>
        <input
          type="text"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Consultation Fee (BDT)
        </label>
        <input
          type="number"
          value={formData.consultationFee}
          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visiting Days
        </label>
        <input
          type="text"
          value={formData.visitingDays}
          onChange={(e) => setFormData({ ...formData, visitingDays: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Sat, Mon, Wed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visiting Time
        </label>
        <input
          type="text"
          value={formData.visitingTime}
          onChange={(e) => setFormData({ ...formData, visitingTime: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. 10:00 AM - 2:00 PM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile URL
        </label>
        <input
          type="url"
          value={formData.profileUrl}
          onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Appointment URL
        </label>
        <input
          type="url"
          value={formData.appointmentUrl}
          onChange={(e) => setFormData({ ...formData, appointmentUrl: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Active
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : doctor ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
