'use client';

// Hybrid storage for promo codes (localStorage + MongoDB)
// Maintains the same API but uses MongoDB when available

// Local cache for promo codes
let promoCodesCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

// Get all promo codes
export const getPromoCodes = async () => {
  // Check if we have a fresh cache
  const now = Date.now();
  if (promoCodesCache && (now - lastFetchTime < CACHE_TTL)) {
    console.log('Using cached promo codes');
    return promoCodesCache;
  }

  try {
    // Try to fetch from API first
    console.log('Fetching promo codes from API');
    const response = await fetch('/api/promo-codes');

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.promoCodes) {
        // Update cache
        promoCodesCache = data.promoCodes;
        lastFetchTime = now;

        // Also update localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('promoCodes', JSON.stringify(data.promoCodes));
        }

        return data.promoCodes;
      }
    }
  } catch (error) {
    console.error('Error fetching promo codes from API:', error);
  }

  // Fallback to localStorage if API fails
  if (typeof window !== 'undefined') {
    try {
      const storedPromoCodes = localStorage.getItem('promoCodes');
      if (storedPromoCodes) {
        const promoCodes = JSON.parse(storedPromoCodes);
        promoCodesCache = promoCodes;
        lastFetchTime = now;
        return promoCodes;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }

  return [];
};

// Add a new promo code
export const addPromoCode = async (promoCode) => {
  try {
    // Add to API
    const response = await fetch('/api/promo-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promoCode),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Invalidate cache
        promoCodesCache = null;

        // Also update localStorage as fallback
        const currentPromoCodes = await getPromoCodes();
        if (typeof window !== 'undefined') {
          localStorage.setItem('promoCodes', JSON.stringify([...currentPromoCodes, data.promoCode]));
        }

        return data.promoCode;
      }
    }

    throw new Error('Failed to add promo code to API');
  } catch (error) {
    console.error('Error adding promo code to API:', error);

    // Fallback to localStorage
    try {
      const currentPromoCodes = await getPromoCodes();
      const newPromoCode = {
        ...promoCode,
        _id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('promoCodes', JSON.stringify([...currentPromoCodes, newPromoCode]));
      }

      // Invalidate cache
      promoCodesCache = null;

      return newPromoCode;
    } catch (localError) {
      console.error('Error adding promo code to localStorage:', localError);
      throw error;
    }
  }
};

// Update a promo code
export const updatePromoCode = async (id, updates) => {
  try {
    // Update in API
    const response = await fetch(`/api/promo-codes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Invalidate cache
        promoCodesCache = null;

        // Also update localStorage as fallback
        const currentPromoCodes = await getPromoCodes();
        const updatedPromoCodes = currentPromoCodes.map(pc =>
          pc._id === id ? { ...pc, ...updates, updatedAt: new Date().toISOString() } : pc
        );

        if (typeof window !== 'undefined') {
          localStorage.setItem('promoCodes', JSON.stringify(updatedPromoCodes));
        }

        return data.promoCode;
      }
    }

    throw new Error('Failed to update promo code in API');
  } catch (error) {
    console.error('Error updating promo code in API:', error);

    // Fallback to localStorage
    try {
      const currentPromoCodes = await getPromoCodes();
      const updatedPromoCodes = currentPromoCodes.map(pc =>
        pc._id === id ? { ...pc, ...updates, updatedAt: new Date().toISOString() } : pc
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem('promoCodes', JSON.stringify(updatedPromoCodes));
      }

      // Invalidate cache
      promoCodesCache = null;

      return updatedPromoCodes.find(pc => pc._id === id);
    } catch (localError) {
      console.error('Error updating promo code in localStorage:', localError);
      throw error;
    }
  }
};

// Delete a promo code
export const deletePromoCode = async (id) => {
  try {
    // Delete from API
    const response = await fetch(`/api/promo-codes/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Invalidate cache
      promoCodesCache = null;

      // Also update localStorage as fallback
      const currentPromoCodes = await getPromoCodes();
      const filteredPromoCodes = currentPromoCodes.filter(pc => pc._id !== id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('promoCodes', JSON.stringify(filteredPromoCodes));
      }

      return true;
    }
    
    // Log more details about the failed response
    const errorData = await response.json().catch(() => ({}));
    console.error('API Response Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });

    throw new Error(`Failed to delete promo code from API: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('Error deleting promo code from API:', error);

    // Fallback to localStorage
    try {
      const currentPromoCodes = await getPromoCodes();
      const filteredPromoCodes = currentPromoCodes.filter(pc => pc._id !== id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('promoCodes', JSON.stringify(filteredPromoCodes));
      }

      // Invalidate cache
      promoCodesCache = null;

      return true;
    } catch (localError) {
      console.error('Error deleting promo code from localStorage:', localError);
      throw error;
    }
  }
};

// Get a single promo code by ID
export const getPromoCodeById = async (id) => {
  const promoCodes = await getPromoCodes();
  return promoCodes.find(pc => pc._id === id) || null;
};

// Get active promo codes only
export const getActivePromoCodes = async () => {
  try {
    // Try to fetch from API first
    console.log('Fetching active promo codes from API');
    const response = await fetch('/api/promo-codes?active=true');

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.promoCodes) {
        return data.promoCodes;
      }
    }
  } catch (error) {
    console.error('Error fetching active promo codes from API:', error);
  }

  // Fallback to filtering local cache
  const promoCodes = await getPromoCodes();
  return promoCodes.filter(pc => pc.isActive);
};

// Create the default export object
const promoCodeStorage = {
  getPromoCodes,
  getPromoCodeById,
  addPromoCode,
  updatePromoCode,
  deletePromoCode,
  getActivePromoCodes
};

export default promoCodeStorage;
