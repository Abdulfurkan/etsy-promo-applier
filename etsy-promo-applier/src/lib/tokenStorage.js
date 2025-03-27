'use client';

import tokenEvents from './tokenEvents';

// Hybrid storage for tokens (localStorage + MongoDB)
// Maintains the same API but uses MongoDB when available

// Local cache for tokens
let tokensCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

// Get all tokens
export const getTokens = async () => {
  // Check if we have a fresh cache
  const now = Date.now();
  if (tokensCache && (now - lastFetchTime < CACHE_TTL)) {
    console.log('Using cached tokens');
    return tokensCache;
  }
  
  try {
    // Try to fetch from API first
    console.log('Fetching tokens from API');
    const response = await fetch('/api/tokens');
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.tokens) {
        // Update cache
        tokensCache = data.tokens;
        lastFetchTime = now;
        
        // Also update localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('tokens', JSON.stringify(data.tokens));
        }
        
        return data.tokens;
      }
    }
  } catch (error) {
    console.error('Error fetching tokens from API:', error);
  }
  
  // Fallback to localStorage if API fails
  if (typeof window !== 'undefined') {
    try {
      const storedTokens = localStorage.getItem('tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        tokensCache = tokens;
        lastFetchTime = now;
        return tokens;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }
  
  return [];
};

// Get a specific token by its value
export const getToken = async (tokenValue) => {
  try {
    // Try to fetch from API first
    console.log(`Fetching token ${tokenValue} from API`);
    const response = await fetch(`/api/tokens/${tokenValue}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        return data.token;
      }
    }
  } catch (error) {
    console.error(`Error fetching token ${tokenValue} from API:`, error);
  }
  
  // Fallback to localStorage if API fails
  const tokens = await getTokens();
  return tokens.find(t => t.token === tokenValue) || null;
};

// Generate a new token
export const generateToken = async (promoCodeId, expiresAt = null) => {
  try {
    // Generate via API
    console.log(`Generating token for promo code ${promoCodeId} via API`);
    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promoCodeId,
        expiresAt
      }),
    });
    
    // Log the response status for debugging
    console.log(`Token generation API response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        // Invalidate cache
        tokensCache = null;
        
        return data.token;
      }
      
      // If we got a response but it wasn't successful, log the error
      console.error('API returned error:', data);
      throw new Error(data.error || 'API returned unsuccessful response');
    }
    
    // If response wasn't ok, try to get more error details
    const errorData = await response.json().catch(() => ({}));
    console.error('Token generation API error:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    // If API fails with 500, likely MongoDB issue, so force fallback to localStorage
    if (response.status === 500) {
      console.log('API failed with 500 error, falling back to localStorage');
      throw new Error('MongoDB connection error, falling back to localStorage');
    }
    
    throw new Error(`Failed to generate token via API: ${response.status} ${response.statusText} - ${errorData.error || ''}`);
  } catch (error) {
    console.error('Error generating token via API:', error);
    
    // Fallback to localStorage
    try {
      console.log('Using localStorage fallback for token generation');
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const newToken = {
        token,
        promoCodeId,
        isUsed: false,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      // Add to localStorage
      const tokens = await getTokens();
      if (typeof window !== 'undefined') {
        localStorage.setItem('tokens', JSON.stringify([...tokens, newToken]));
      }
      
      // Invalidate cache
      tokensCache = null;
      
      console.log('Successfully created token in localStorage:', newToken);
      return newToken;
    } catch (localError) {
      console.error('Error generating token in localStorage:', localError);
      throw error;
    }
  }
};

// Mark a token as used
export const markTokenAsUsed = async (tokenValue) => {
  try {
    // Mark as used via API
    console.log(`Marking token ${tokenValue} as used via API`);
    const response = await fetch(`/api/tokens/${tokenValue}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isUsed: true,
        usedAt: new Date().toISOString()
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Invalidate cache
        tokensCache = null;
        
        // Emit token used event with the promo code (masked for security)
        tokenEvents.emit('token-used', {
          token: tokenValue,
          status: 'success',
          message: 'Promo code applied successfully',
          success: true
        });
        
        return data.token;
      }
    }
    
    throw new Error('Failed to mark token as used via API');
  } catch (error) {
    console.error(`Error marking token ${tokenValue} as used via API:`, error);
    
    // Fallback to localStorage
    try {
      const tokens = await getTokens();
      const tokenIndex = tokens.findIndex(t => t.token === tokenValue);
      
      if (tokenIndex !== -1) {
        tokens[tokenIndex].isUsed = true;
        tokens[tokenIndex].usedAt = new Date().toISOString();
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('tokens', JSON.stringify(tokens));
        }
        
        // Invalidate cache
        tokensCache = null;
        
        // Emit token used event
        tokenEvents.emit('token-used', {
          token: tokenValue,
          status: 'success',
          message: 'Promo code applied successfully',
          success: true
        });
        
        return tokens[tokenIndex];
      }
    } catch (localError) {
      console.error(`Error marking token ${tokenValue} as used in localStorage:`, localError);
    }
    
    throw error;
  }
};

// Delete a token
export const deleteToken = async (tokenValue) => {
  try {
    // Delete via API
    console.log(`Deleting token ${tokenValue} via API`);
    const response = await fetch(`/api/tokens/${tokenValue}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      // Invalidate cache
      tokensCache = null;
      
      // Also update localStorage
      const tokens = await getTokens();
      const filteredTokens = tokens.filter(t => t.token !== tokenValue);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('tokens', JSON.stringify(filteredTokens));
      }
      
      return true;
    }
    
    throw new Error('Failed to delete token via API');
  } catch (error) {
    console.error(`Error deleting token ${tokenValue} via API:`, error);
    
    // Fallback to localStorage
    try {
      const tokens = await getTokens();
      const filteredTokens = tokens.filter(t => t.token !== tokenValue);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('tokens', JSON.stringify(filteredTokens));
      }
      
      // Invalidate cache
      tokensCache = null;
      
      return true;
    } catch (localError) {
      console.error(`Error deleting token ${tokenValue} from localStorage:`, localError);
      throw error;
    }
  }
};

// Create the default export object
const tokenStorage = {
  getTokens,
  getToken,
  generateToken,
  markTokenAsUsed,
  deleteToken
};

export default tokenStorage;
