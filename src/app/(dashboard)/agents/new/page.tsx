'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AgentForm from '../agent-form';

export default function NewAgentPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Agent</h1>
      <AgentForm />
    </div>
  );
}
