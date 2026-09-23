import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';

interface TestDetail {
  id: string;
  testName: string;
  actualCost: number;
  discountPercent: number;
  finalCost: number;
  reportUrl?: string;
  prescriptionUrl?: string;
  receiptUrl?: string;
  status: string;
  appointment: {
    patient: { name: string };
    doctor?: { name: string };
  };
}

async function getTest(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/tests/${id}`, token);
}

export default async function TestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getTest(params.id);

  if (!data || !data.success) {
    notFound();
  }

  const test: TestDetail = data.data;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Details</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Test Name</label>
          <p className="text-lg">{test.testName}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Patient</label>
          <p className="text-lg">{test.appointment.patient.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Doctor</label>
          <p className="text-lg">{test.appointment.doctor?.name || 'Not assigned'}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Actual Cost</label>
            <p className="text-lg">{test.actualCost} BDT</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Discount</label>
            <p className="text-lg">{test.discountPercent}%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Final Cost</label>
            <p className="text-lg">{test.finalCost} BDT</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Status</label>
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${
              test.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {test.status}
          </span>
        </div>

        {test.reportUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Report</label>
            <a
              href={test.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Report
            </a>
          </div>
        )}

        {test.prescriptionUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Prescription</label>
            <a
              href={test.prescriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Prescription
            </a>
          </div>
        )}

        {test.receiptUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Receipt</label>
            <a
              href={test.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Receipt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
