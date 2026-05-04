"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component will redirect any traffic from /admin to /painel
export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/painel');
  }, [router]);

  // You can show a loader here if needed, but the redirect is usually fast.
  return null;
}
