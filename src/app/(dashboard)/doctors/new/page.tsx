'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DoctorForm from '../doctor-form';

export default function NewDoctorPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Doctor</h1>
      <DoctorForm />
    </div>
  );
}
