'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock data for demonstration
// In a real app, this would be fetched from your database
const MOCK_TOKENS = [
  {
    _id: '102',
    token: 'tkn_2c4b6a8d0e9f1',
    promoCode: {
      code: 'ETSY10',
      description: '10% off for new customers'
    },
    isUsed: true,
    usedAt: new Date('2025-03-20T09:15:30').toISOString(),
    createdAt: new Date('2025-03-15').toISOString(),
    userIp: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    _id: '104',
    token: 'tkn_9a8b7c6d5e4f',
    promoCode: {
      code: 'SPRING15',
      description: '15% off spring collection'
    },
    isUsed: true,
    usedAt: new Date('2025-03-22T14:22:45').toISOString(),
    createdAt: new Date('2025-03-10').toISOString(),
    userIp: '192.168.1.107',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    _id: '105',
    token: 'tkn_3e4f5d6c7b8a',
    promoCode: {
      code: 'WELCOME20',
      description: '20% off for new customers'
    },
    isUsed: true,
    usedAt: new Date('2025-03-25T11:05:12').toISOString(),
    createdAt: new Date('2025-03-18').toISOString(),
    userIp: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];

export default function AnalyticsPage() {
  const [usedTokens, setUsedTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  // Load mock data
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setUsedTokens(MOCK_TOKENS);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter tokens based on time range
  const filteredTokens = usedTokens.filter(token => {
    const usedDate = new Date(token.usedAt);
    const now = new Date();
    
    switch(timeRange) {
      case 'today':
        return usedDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return usedDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return usedDate >= monthAgo;
      default:
        return true; // 'all'
    }
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track token usage and performance
              </p>
            </div>
            <div className="flex gap-3">
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

          {/* Time Range Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Filter by Time Range</h2>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange('today')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === 'today'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          {/* Used Tokens Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
              Token Usage History
            </h2>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading analytics data...</p>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No token usage data found for the selected time period.</p>
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
                        Used On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTokens.map(token => (
                      <tr key={token._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {token.token}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {token.promoCode.code}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {token.promoCode.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDate(token.usedAt)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(token.usedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            IP: {token.userIp}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {token.userAgent}
                          </div>
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
