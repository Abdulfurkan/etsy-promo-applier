'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data for demonstration
const MOCK_PROMO_CODES = [
  {
    _id: '1',
    code: '1320',
    description: '25% off summer collection',
    usageCount: 12,
    maxUsage: 100,
    isActive: true,
    createdAt: new Date('2025-03-01').toISOString()
  },
  {
    _id: '2',
    code: 'ETSY10',
    description: '10% off for new customers',
    usageCount: 45,
    maxUsage: 200,
    isActive: true,
    createdAt: new Date('2025-02-15').toISOString()
  },
  {
    _id: '3',
    code: 'HOL30',
    description: '30% off holiday items',
    usageCount: 78,
    maxUsage: 150,
    isActive: false,
    createdAt: new Date('2025-01-10').toISOString()
  }
];

export default function EditPromoCodePage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [promoCode, setPromoCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    maxUsage: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load promo code data
  useEffect(() => {
    // Simulate API call to fetch the promo code
    const timer = setTimeout(() => {
      const foundCode = MOCK_PROMO_CODES.find(code => code._id === id);
      
      if (foundCode) {
        setPromoCode(foundCode);
        setFormData({
          code: foundCode.code,
          description: foundCode.description || '',
          maxUsage: foundCode.maxUsage ? foundCode.maxUsage.toString() : '',
          isActive: foundCode.isActive
        });
      } else {
        setError('Promo code not found');
      }
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Simulate API call to update the promo code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would update the database here
      // For demo purposes, we'll just show a success message
      
      setSuccessMessage('Promo code updated successfully');
      setSaving(false);
      
      // Navigate back to promo codes list after a delay
      setTimeout(() => {
        router.push('/admin/promo-codes');
      }, 1500);
      
    } catch (error) {
      setError('An error occurred while updating the promo code');
      setSaving(false);
      console.error('Update error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Edit Promo Code
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update promo code details
              </p>
            </div>
            <div>
              <Link 
                href="/admin/promo-codes"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Back to Promo Codes
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
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading promo code...</p>
            </div>
          ) : promoCode ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
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
                      value={formData.description}
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
                      value={formData.maxUsage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                      />
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Usage Count: <span className="font-medium">{promoCode.usageCount}</span>
                    <br />
                    Created: <span className="font-medium">{new Date(promoCode.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      href="/admin/promo-codes"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Promo code not found</p>
              <Link 
                href="/admin/promo-codes"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                Back to Promo Codes
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
