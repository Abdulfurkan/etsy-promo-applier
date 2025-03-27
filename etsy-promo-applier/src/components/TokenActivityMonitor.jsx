'use client';

import { useState, useEffect, useRef } from 'react';
import tokenEvents from '../lib/tokenEvents';

export default function TokenActivityMonitor() {
  const [activities, setActivities] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const activitiesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('TokenActivityMonitor mounted');
    
    // Function to update activities
    const updateActivities = (newActivities) => {
      activitiesRef.current = newActivities;
      setActivities(newActivities);
    };

    // Function to force refresh activities from storage
    const refreshActivities = () => {
      console.log('Refreshing activities from storage');
      updateActivities(tokenEvents.getEvents());
    };

    // Set up interval to periodically refresh activities from storage
    const refreshInterval = setInterval(refreshActivities, 5000);

    // Load initial events with a small delay to improve initial page load performance
    const timer = setTimeout(() => {
      refreshActivities();
      setIsLoading(false);
      
      // Subscribe to token usage events
      const handleTokenEvent = (event) => {
        console.log('Token event received in monitor:', event);
        const newActivities = [event, ...activitiesRef.current].slice(0, 50);
        updateActivities(newActivities);
      };
      
      const unsubscribe = tokenEvents.on('token-used', handleTokenEvent);
      
      return () => {
        console.log('Unsubscribing from token events');
        unsubscribe();
      };
    }, 100); // Small delay for better initial loading

    return () => {
      clearTimeout(timer);
      clearInterval(refreshInterval);
    };
  }, []);  // Remove isLive dependency to prevent resubscribing

  // Toggle live updates
  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  // Format date for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Force a refresh of the activities
  const refreshActivitiesManual = () => {
    console.log('Manual refresh of activities');
    setActivities(tokenEvents.getEvents());
  };

  // Get appropriate status color based on activity status
  const getStatusColor = (activity) => {
    if (activity.status === 'processing') {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
    } else if (activity.status === 'success') {
      return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    } else if (activity.status === 'error') {
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    } else {
      return 'bg-gray-50 dark:bg-gray-700/30 border-l-4 border-gray-400';
    }
  };

  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Live Token Activity</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Live Token Activity</h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <button 
            onClick={toggleLiveUpdates}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={refreshActivitiesManual}
            className="ml-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No token activity yet</p>
          <p className="text-sm mt-2">Token usage events will appear here in real-time</p>
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          <ul className="space-y-3">
            {activities.map(activity => (
              <li 
                key={activity.id} 
                className={`p-3 rounded-lg text-sm ${getStatusColor(activity)}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    Token: {activity.token}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <p className="mt-1">
                  {activity.message}
                </p>
                
                {/* Show error code if present */}
                {activity.errorCode && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Error code: {activity.errorCode}
                  </p>
                )}
                
                {/* Show promo code for admin visibility if present */}
                {activity.promoCode && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Promo code: {activity.promoCode}
                  </p>
                )}
                
                <div className="mt-1 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${getBadgeColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
