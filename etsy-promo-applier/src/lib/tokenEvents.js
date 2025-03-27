'use client';

// Token events system with MongoDB integration and cross-tab support
class TokenEventEmitter {
  constructor() {
    this.listeners = {};
    this.events = [];
    this.maxEvents = 50; // Maximum number of events to store in memory
    this.storageKey = 'token_events';
    this.lastFetchTime = 0;
    this.fetchInterval = 5000; // Fetch from DB every 5 seconds
    console.log('TokenEventEmitter initialized');
    
    // Initialize events from localStorage if available (for offline support)
    this.loadEventsFromStorage();
    
    // Set up storage event listener for cross-tab communication
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
      
      // Initial fetch from API
      this.fetchEventsFromAPI();
      
      // Set up interval to periodically fetch events from API
      this.apiInterval = setInterval(() => {
        this.fetchEventsFromAPI();
      }, this.fetchInterval);
    }
  }
  
  // Fetch events from the API
  async fetchEventsFromAPI() {
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/token-events?limit=50');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      if (data.success && data.events) {
        console.log('Fetched events from API:', data.events.length);
        
        // Update local events
        this.events = data.events;
        
        // Save to localStorage for offline support
        this.saveEventsToStorage();
        
        // Update last fetch time
        this.lastFetchTime = Date.now();
      }
    } catch (error) {
      console.error('Error fetching events from API:', error);
    }
  }
  
  // Load events from localStorage
  loadEventsFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = localStorage.getItem(this.storageKey);
        if (storedEvents) {
          this.events = JSON.parse(storedEvents);
          console.log('Loaded events from storage:', this.events.length);
        }
      } catch (error) {
        console.error('Error loading events from storage:', error);
      }
    }
  }
  
  // Save events to localStorage
  saveEventsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.events));
      } catch (error) {
        console.error('Error saving events to storage:', error);
      }
    }
  }
  
  // Handle storage events from other tabs
  handleStorageChange = (event) => {
    if (event.key === this.storageKey) {
      try {
        const newEvents = JSON.parse(event.newValue);
        console.log('Storage change detected, updating events');
        this.events = newEvents;
        
        // Notify listeners about the new events
        if (newEvents && newEvents.length > 0) {
          const latestEvent = newEvents[0]; // Most recent event is at index 0
          if (latestEvent && this.listeners['token-used']) {
            this.listeners['token-used'].forEach(callback => {
              try {
                callback(latestEvent);
              } catch (error) {
                console.error('Error in event listener:', error);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    }
  };

  // Add a listener for a specific event
  on(event, callback) {
    console.log(`Adding listener for event: ${event}`);
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return an unsubscribe function
    return () => {
      console.log(`Removing listener for event: ${event}`);
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  async emit(event, data) {
    console.log(`Emitting event: ${event}`, data);
    
    // Add timestamp to the event
    const eventWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };
    
    // Store the event in memory
    this.events.unshift(eventWithTimestamp);
    
    // Limit the number of stored events in memory
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
    
    // Save to localStorage for cross-tab communication
    this.saveEventsToStorage();
    
    // Save to MongoDB via API
    try {
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/token-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventWithTimestamp),
        });
        
        if (!response.ok) {
          console.error('Failed to save event to API:', await response.text());
        } else {
          console.log('Event saved to database successfully');
        }
      }
    } catch (error) {
      console.error('Error saving event to API:', error);
    }
    
    // Notify listeners
    if (this.listeners[event]) {
      console.log(`Notifying ${this.listeners[event].length} listeners for event: ${event}`);
      this.listeners[event].forEach(callback => {
        try {
          callback(eventWithTimestamp);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    } else {
      console.log(`No listeners found for event: ${event}`);
    }
    
    // Log event for debugging
    console.log(`Token event emitted: ${event}`, eventWithTimestamp);
  }

  // Get all stored events
  getEvents() {
    return [...this.events];
  }
  
  // Clean up when no longer needed
  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
      if (this.apiInterval) {
        clearInterval(this.apiInterval);
      }
    }
  }
}

// Create a singleton instance that persists across components
const getTokenEvents = () => {
  if (typeof window !== 'undefined') {
    if (!window.__TOKEN_EVENTS_INSTANCE__) {
      console.log('Creating new TokenEventEmitter instance');
      window.__TOKEN_EVENTS_INSTANCE__ = new TokenEventEmitter();
    } else {
      console.log('Using existing TokenEventEmitter instance');
    }
    return window.__TOKEN_EVENTS_INSTANCE__;
  }
  
  // For server-side rendering, return a dummy implementation
  console.log('Server-side rendering, returning dummy implementation');
  return {
    on: () => () => {},
    emit: () => {},
    getEvents: () => [],
    cleanup: () => {}
  };
};

const tokenEvents = getTokenEvents();
console.log('tokenEvents module loaded');
export default tokenEvents;
