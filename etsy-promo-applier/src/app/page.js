'use client';

import { useState } from 'react';

export default function Home() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  const handleTokenChange = (e) => {
    setToken(e.target.value.trim());
  };

  const applyToken = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Please enter a valid token');
      return;
    }
    
    setStatus('success');
    setMessage('Token application successful!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <h1 className="text-3xl font-bold text-blue-600">
            Etsy Promo Code Applier
          </h1>
        </header>

        <main className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Enter Your Token</h2>
              
              <form onSubmit={applyToken} className="mb-8">
                <div className="bg-gray-100 rounded-lg p-6 mb-4">
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Your Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={handleTokenChange}
                    placeholder="Enter your token here"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 font-mono tracking-wider text-lg"
                    disabled={status === 'processing' || status === 'success'}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    Enter the token you received to apply your promo code. Each token can only be used once.
                  </p>
                </div>
                
                <button 
                  type="submit"
                  className={`w-full py-3 px-6 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg ${
                    status === 'success' ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                  disabled={status === 'success' || !token}
                >
                  {status === 'ready' && 'Apply Token'}
                  {status === 'success' && 'Listing sent'}
                </button>
              </form>
              
              {message && (
                <div className={`mt-4 p-3 rounded-lg ${
                  status === 'success' ? 'bg-green-100 text-green-800' : 
                  status === 'error' ? 'bg-red-100 text-red-800' : ''
                }`}>
                  {message}
                </div>
              )}
              
              <p className="mt-4 text-sm text-gray-500">
                Need a token? Contact us to get your exclusive one-time use promo code.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
