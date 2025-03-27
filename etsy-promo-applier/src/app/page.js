'use client';

import Image from "next/image";
import TokenApplierWrapper from '../components/TokenApplierWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        <header className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-lg p-6 mb-10 sticky top-4 z-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Etsy Promo Code Applier
          </h1>
        </header>

        <main className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <TokenApplierWrapper />
          </div>
        </main>
      </div>
    </div>
  );
}
