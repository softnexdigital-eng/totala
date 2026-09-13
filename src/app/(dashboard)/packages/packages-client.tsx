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
  createdAt: string;
  updatedAt: string;
}

interface PackagesClientProps {
  initialPackages: Package[];
}

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    transportCost: '0',
    guidanceFee: '0',
    doctorFee: '0',
    testFee: '0',
    discountPercent: '0',
    isActive: true,
  });

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      transportCost: '0',
      guidanceFee: '0',
      doctorFee: '0',
      testFee: '0',
      discountPercent: '0',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages';
      const method = editingId ? 'PUT' : 'POST';

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
        toast.success(editingId ? 'Package updated!' : 'Package created!');
        resetForm();
        if (!editingId) {
          setPackages([result.data, ...packages]);
        } else {
          setPackages(packages.map((p) => (p.id === editingId ? result.data : p)));
        }
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsSubmitting(false);
  };

  const handleEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      transportCost: pkg.transportCost.toString(),
      guidanceFee: pkg.guidanceFee.toString(),
      doctorFee: pkg.doctorFee.toString(),
      testFee: pkg.testFee.toString(),
      discountPercent: pkg.discountPercent.toString(),
      isActive: pkg.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Package deleted successfully!');
        setPackages(packages.filter((p) => p.id !== id));
      } else {
        toast.error(result.message || 'Failed to delete package');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Packages</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Package'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Package' : 'Create Package'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Packages List */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No packages found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  <p className="text-sm text-gray-600">{pkg.description || 'No description'}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Transport:</span> {pkg.transportCost} BDT
                </p>
                <p className="text-sm">
                  <span className="font-medium">Guidance:</span> {pkg.guidanceFee} BDT
                </p>
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span> {pkg.doctorFee} BDT
                </p>
                <p className="text-sm">
                  <span className="font-medium">Test:</span> {pkg.testFee} BDT
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total:</span> {pkg.totalPrice} BDT
                </p>
                {pkg.discountPercent > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Discount:</span> {pkg.discountPercent}%
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Final Price:</span> {pkg.finalPrice} BDT
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
