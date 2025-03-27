import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Admin Dashboard
            </h1>
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Promo Codes Management Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Promo Codes</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your Etsy promo codes. Add new codes or edit existing ones.
            </p>
            <Link 
              href="/admin/promo-codes"
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg text-center"
            >
              Manage Promo Codes
            </Link>
          </div>
          
          {/* Tokens Management Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Tokens</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate and manage tokens that users can use to apply promo codes.
            </p>
            <Link 
              href="/admin/tokens"
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg text-center"
            >
              Manage Tokens
            </Link>
          </div>
          
          {/* Analytics Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View usage statistics and track which tokens have been applied.
            </p>
            <Link 
              href="/admin/analytics"
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg text-center"
            >
              View Analytics
            </Link>
          </div>
          
          {/* Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure application settings and manage admin accounts.
            </p>
            <Link 
              href="/admin/settings"
              className="block w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg text-center"
            >
              Manage Settings
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
