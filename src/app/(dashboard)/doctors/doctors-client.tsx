'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Doctor {
  id: string;
  name: string;
  designation?: string;
  specialty?: string;
  consultationFee?: number;
  hospital?: string;
  visitingDays?: string;
  visitingTime?: string;
  appointmentUrl?: string;
  isActive: boolean;
}

interface DoctorsClientProps {
  initialDoctors: Doctor[];
}

export default function DoctorsClient({ initialDoctors }: DoctorsClientProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.hospital || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Doctor deleted successfully!');
        setDoctors(doctors.filter((d) => d.id !== id));
      } else {
        toast.error(result.message || 'Failed to delete doctor');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.populardiagnostic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1.5 bg-white border rounded hover:bg-gray-100"
          >
            Popular Diagnostic
          </a>
          <a
            href="https://app.sayemhospital.com/doctors"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1.5 bg-white border rounded hover:bg-gray-100"
          >
            Sayem Hospital Doctors
          </a>
          <a
            href="https://sodesh.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1.5 bg-white border rounded hover:bg-gray-100"
          >
            Sodesh
          </a>
          <a
            href="https://seradoctor.com/blog-details/delta-hospital-mymensingh-doctor-list"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1.5 bg-white border rounded hover:bg-gray-100"
          >
            Delta Hospital Doctor List
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Visiting Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No doctors found
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.designation || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.specialty || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doctor.consultationFee != null ? `${doctor.consultationFee} BDT` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.hospital || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doctor.visitingDays || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {doctor.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/doctors/${doctor.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
