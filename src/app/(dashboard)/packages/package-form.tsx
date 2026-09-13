'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Package {
  id: string;
  name: string;
  description?: string;
  transportCost: number;
  guidanceFee: number;
  doctorFee: number;
  testFee: number;
  totalPrice: number;
  discountPercent: number;
  finalPrice: number;
  isActive: boolean;
}

interface PackageFormProps {
  packageData?: Package;
}

export default function PackageForm({ packageData }: PackageFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: packageData?.name || '',
    description: packageData?.description || '',
    transportCost: packageData?.transportCost?.toString() || '0',
    guidanceFee: packageData?.guidanceFee?.toString() || '0',
    doctorFee: packageData?.doctorFee?.toString() || '0',
    testFee: packageData?.testFee?.toString() || '0',
    discountPercent: packageData?.discountPercent?.toString() || '0',
    isActive: packageData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = packageData ? `/api/packages/${packageData.id}` : '/api/packages';
      const method = packageData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          transportCost: parseFloat(formData.transportCost),
          guidanceFee: parseFloat(formData.guidanceFee),
          doctorFee: parseFloat(formData.doctorFee),
          testFee: parseFloat(formData.testFee),
          discountPercent: parseFloat(formData.discountPercent),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(packageData ? 'Package updated!' : 'Package created!');
        router.push('/packages');
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
          Package Name *
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
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transport Cost (BDT)
          </label>
          <input
            type="number"
            value={formData.transportCost}
            onChange={(e) => setFormData({ ...formData, transportCost: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guidance Fee (BDT)
          </label>
          <input
            type="number"
            value={formData.guidanceFee}
            onChange={(e) => setFormData({ ...formData, guidanceFee: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor Fee (BDT)
          </label>
          <input
            type="number"
            value={formData.doctorFee}
            onChange={(e) => setFormData({ ...formData, doctorFee: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Fee (BDT)
          </label>
          <input
            type="number"
            value={formData.testFee}
            onChange={(e) => setFormData({ ...formData, testFee: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            value={formData.discountPercent}
            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>
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
          {isLoading ? 'Saving...' : packageData ? 'Update' : 'Create'}
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
