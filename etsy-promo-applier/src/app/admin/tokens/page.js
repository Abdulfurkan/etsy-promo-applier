'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTokens, generateToken, markTokenAsUsed, deleteToken } from '../../../lib/tokenStorage';
import { getPromoCodes } from '../../../lib/promoCodeStorage';
import TokenActivityMonitor from '../../../components/TokenActivityMonitor';

export default function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newToken, setNewToken] = useState({ promoCodeId: '', customToken: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);

  // Load tokens and promo codes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get tokens from shared storage
        const tokensArray = await getTokens();
        // Ensure tokens is always an array
        setTokens(Array.isArray(tokensArray) ? tokensArray : []);
        
        // Get promo codes from shared storage
        const storedPromoCodes = await getPromoCodes();
        // Filter to only include active promo codes
        const activePromoCodes = Array.isArray(storedPromoCodes) 
          ? storedPromoCodes.filter(code => code.isActive)
          : [];
        setPromoCodes(activePromoCodes);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
        // Initialize with empty arrays on error
        setTokens([]);
        setPromoCodes([]);
      }
    };
    
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewToken(prev => ({ ...prev, [name]: value }));
  };

  // Add new token
  const handleAddToken = async (e) => {
    e.preventDefault();
    
    try {
      // Get selected promo code
      const selectedPromoCode = promoCodes.find(code => code._id === newToken.promoCodeId);
      
      if (!selectedPromoCode) {
        setError('Please select a valid promo code');
        return;
      }
      
      console.log('Generating token for promo code:', selectedPromoCode);
      
      // Generate token using the generateToken function from tokenStorage
      const generatedToken = await generateToken(selectedPromoCode._id);
      
      // Refresh tokens list
      const updatedTokens = await getTokens();
      setTokens(updatedTokens);
      
      // Reset form
      setNewToken({ promoCodeId: '', customToken: '' });
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Add token error details:', error);
      setError(`Error adding token: ${error.message || 'Unknown error'}`);
    }
  };

  // Toggle token usage status
  const toggleTokenUsage = async (tokenValue, currentStatus) => {
    try {
      if (!currentStatus) {
        // Mark token as used
        await markTokenAsUsed(tokenValue);
      } else {
        // In a real app, you might want to have a separate function to mark as unused
        // For now, we'll just update the state
      }
      
      // Refresh tokens list
      const updatedTokens = await getTokens();
      setTokens(updatedTokens);
      
    } catch (error) {
      setError('An error occurred while updating token');
      console.error('Update error:', error);
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
                Tokens
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Generate and manage one-time use tokens
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Generate New Token'}
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

          {/* Token Activity Monitor */}
          <TokenActivityMonitor />

          {/* Add Token Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Generate New Token</h2>
              
              <form onSubmit={handleAddToken}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Select Promo Code
                    </label>
                    <select
                      name="promoCodeId"
                      value={newToken.promoCodeId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a promo code</option>
                      {promoCodes.map(code => (
                        <option key={code._id} value={code._id}>
                          {code.code} - {code.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                      Custom Token (Optional)
                    </label>
                    <input
                      type="text"
                      name="customToken"
                      value={newToken.customToken}
                      onChange={handleInputChange}
                      placeholder="Leave blank to auto-generate"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Custom tokens should start with &quot;tkn_&quot; followed by alphanumeric characters
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tokens Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tokens</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading tokens...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                {error}
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No tokens found. Generate a new token to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Promo Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Used
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Array.isArray(tokens) && tokens.map((token) => (
                      <tr key={token._id || token.token} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {token.token}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {token.promoCode?.code || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {token.promoCode?.description || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            token.isUsed 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {token.isUsed ? 'Used' : 'Available'}
                            {token.usedAt && ` on ${formatDate(token.usedAt)}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(token.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {token.usedAt ? formatDate(token.usedAt) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {token.isUsed ? (
                            <span className="text-gray-500 dark:text-gray-400">Used</span>
                          ) : (
                            <button
                              onClick={() => toggleTokenUsage(token.token, token.isUsed)}
                              className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 ${!token.promoCode?.isActive && 'opacity-50 cursor-not-allowed'}`}
                              disabled={!token.promoCode?.isActive}
                            >
                              Mark as Used
                            </button>
                          )}
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
