'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPromoCodes, addPromoCode, updatePromoCode, deletePromoCode } from '../../../lib/promoCodeStorage';

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCode, setNewCode] = useState({ code: '', description: '', maxUsage: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load promo codes from storage
  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        setLoading(true);
        // Use await with getPromoCodes since it's now async
        const storedPromoCodes = await getPromoCodes();
        setPromoCodes(storedPromoCodes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching promo codes:', error);
        setError('Failed to load promo codes');
        setLoading(false);
      }
    };

    fetchPromoCodes();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCode(prev => ({ ...prev, [name]: value }));
  };

  // Add new promo code
  const handleAddPromoCode = async (e) => {
    e.preventDefault();

    try {
      // Create a new promo code
      const newPromoCode = {
        code: newCode.code,
        description: newCode.description || '',
        usageCount: 0,
        maxUsage: newCode.maxUsage ? parseInt(newCode.maxUsage) : null,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Add to persistent storage - use await
      const savedPromoCode = await addPromoCode(newPromoCode);

      // Update the state with the saved promo code
      setPromoCodes(prev => [savedPromoCode, ...prev.filter(code => code._id !== savedPromoCode._id)]);

      // Reset form
      setNewCode({ code: '', description: '', maxUsage: '' });
      setShowAddForm(false);

    } catch (error) {
      setError('An error occurred while adding promo code');
      console.error('Add error:', error);
    }
  };

  // Toggle promo code active status
  const togglePromoCodeStatus = async (id, currentStatus) => {
    try {
      // Update in persistent storage
      const updatedPromoCode = await updatePromoCode(id, { isActive: !currentStatus });

      // Update the state
      setPromoCodes(prev =>
        prev.map(code => code._id === id ? updatedPromoCode : code)
      );

    } catch (error) {
      setError('An error occurred while updating promo code');
      console.error('Update error:', error);
    }
  };

  // Delete a promo code
  const handleDeletePromoCode = async (id) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      try {
        // Delete from persistent storage
        await deletePromoCode(id);

        // Update the state
        setPromoCodes(prev => prev.filter(code => code._id !== id));

      } catch (error) {
        setError('An error occurred while deleting promo code');
        console.error('Delete error:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Promo Codes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your Etsy promo codes
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Add New Code'}
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
              {error}
            </div>
          )}

          {/* Add Promo Code Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Add New Promo Code</h2>

              <form onSubmit={handleAddPromoCode}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={newCode.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={newCode.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Max Usage (optional)
                    </label>
                    <input
                      type="number"
                      name="maxUsage"
                      value={newCode.maxUsage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Add Promo Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Promo Codes List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading promo codes...</p>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No promo codes found. Add your first one!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {promoCodes.map((code) => (
                      <tr key={code._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {code.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {code.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {code.usageCount} / {code.maxUsage || '∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${code.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            {code.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => togglePromoCodeStatus(code._id, code.isActive)}
                            className={`mr-3 ${code.isActive
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                          >
                            {code.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeletePromoCode(code._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                          <Link
                            href={`/admin/promo-codes/${code._id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
