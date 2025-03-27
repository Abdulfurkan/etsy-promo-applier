'use client';

import { useState, useEffect } from 'react';
import { getToken, markTokenAsUsed } from '../lib/tokenStorage';
import tokenEvents from '../lib/tokenEvents';

// Simulate Etsy API response for testing
const simulateEtsyApiCall = async (promoCode) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate different Etsy API responses based on promo code
  if (promoCode === '1320') {
    return { success: true, message: 'Promo code applied successfully' };
  } else if (promoCode === 'ETSY10') {
    return { success: true, message: 'Promo code applied successfully' };
  } else if (promoCode === 'HOL30') {
    return { success: false, message: 'Promo code expired', errorCode: 'PROMO_EXPIRED' };
  } else if (promoCode === 'SPRING15') {
    return { success: false, message: 'Invalid promo code format', errorCode: 'INVALID_FORMAT' };
  } else {
    // For any other promo code, simulate a random error
    const errors = [
      { success: false, message: 'Promo code not found on Etsy', errorCode: 'NOT_FOUND' },
      { success: false, message: 'Promo code usage limit exceeded', errorCode: 'USAGE_LIMIT' },
      { success: false, message: 'Etsy API connection error', errorCode: 'API_ERROR' }
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }
};

export default function TokenApplier() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('TokenApplier component mounted');
    return () => {
      console.log('TokenApplier component unmounted');
    };
  }, []);

  const handleTokenChange = (e) => {
    setToken(e.target.value.trim());
  };

  const applyToken = async (e) => {
    e.preventDefault();
    console.log('Applying token:', token);
    
    if (!token) {
      setStatus('error');
      setMessage('Please enter a valid token');
      return;
    }
    
    try {
      setStatus('processing');
      setMessage('');
      
      // Emit processing event
      console.log('Emitting processing event');
      tokenEvents.emit('token-used', {
        token: token,
        status: 'processing',
        message: 'Token application in progress',
        success: null
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tokenData = getToken(token);
      console.log('Token data:', tokenData);
      
      if (!tokenData) {
        setStatus('error');
        setMessage('Invalid token. Please check and try again.');
        
        // Emit error event
        console.log('Emitting invalid token event');
        tokenEvents.emit('token-used', {
          token: token,
          status: 'error',
          message: 'Invalid token',
          success: false
        });
        return;
      }
      
      if (tokenData.isUsed) {
        setStatus('error');
        setMessage('This token has already been used and cannot be applied again.');
        
        // Emit already used event
        console.log('Emitting token already used event');
        tokenEvents.emit('token-used', {
          token: token,
          status: 'error',
          message: 'Token already used',
          success: false
        });
        return;
      }
      
      // Simulate Etsy API call to apply the promo code
      console.log('Calling Etsy API with promo code:', tokenData.promoCode);
      const etsyResponse = await simulateEtsyApiCall(tokenData.promoCode);
      
      if (!etsyResponse.success) {
        // Etsy API returned an error
        setStatus('error');
        setMessage('Error applying promo code. Please try again later.');
        
        // Emit Etsy API error event
        console.log('Emitting Etsy API error event');
        tokenEvents.emit('token-used', {
          token: token,
          status: 'error',
          message: `Etsy error: ${etsyResponse.message}`,
          errorCode: etsyResponse.errorCode,
          promoCode: tokenData.promoCode,
          success: false
        });
        return;
      }
      
      // Mark token as used - this will emit a success event through the markTokenAsUsed function
      console.log('Marking token as used');
      markTokenAsUsed(token);
      
      setStatus('success');
      setMessage('Listing sent');
      
      // Emit additional success event with Etsy details
      tokenEvents.emit('token-used', {
        token: token,
        status: 'success',
        message: 'Promo code applied successfully',
        promoCode: tokenData.promoCode,
        etsyMessage: etsyResponse.message,
        success: true
      });
      
      console.log(`Applied promo code ${tokenData.promoCode} for token ${token}`);
      
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while applying the token.');
      console.error('Error applying token:', error);
      
      // Emit error event
      console.log('Emitting system error event');
      tokenEvents.emit('token-used', {
        token: token,
        status: 'error',
        message: 'System error occurred',
        errorDetails: error.message,
        success: false
      });
    }
  };

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Enter Your Token</h2>
      
      <form onSubmit={applyToken} className="mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
            Your Token
          </label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={handleTokenChange}
            placeholder="Enter your token here"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono tracking-wider text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={status === 'processing' || status === 'success'}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-left">
            Enter the token you received to apply your promo code. Each token can only be used once.
          </p>
        </div>
        
        <button 
          type="submit"
          className={`w-full py-3 px-6 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg ${
            status === 'processing' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : status === 'success'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : status === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          disabled={status === 'processing' || status === 'success' || !token}
        >
          {status === 'ready' && 'Apply Token'}
          {status === 'processing' && (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          )}
          {status === 'success' && 'Listing sent'}
          {status === 'error' && 'Try Again'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
          status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''
        }`}>
          {message}
        </div>
      )}
      
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Need a token? Contact us to get your exclusive one-time use promo code.
      </p>
    </div>
  );
}
