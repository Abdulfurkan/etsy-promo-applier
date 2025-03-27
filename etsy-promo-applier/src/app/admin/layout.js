'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // In a real app, you'd verify the token validity with an API call
    // For this simplified version, we just check if the token exists
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // For login page, or if authenticated
  if (pathname === '/admin/login' || isAuthenticated) {
    return children;
  }

  // This should never be reached due to the redirect in useEffect
  return null;
}
