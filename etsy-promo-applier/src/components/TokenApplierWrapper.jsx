'use client';

import dynamic from 'next/dynamic';

// Import the client component with no SSR
const TokenApplier = dynamic(() => import('./TokenApplier'), { ssr: false });

export default function TokenApplierWrapper({ token }) {
  return <TokenApplier token={token} />;
}
