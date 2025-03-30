'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useGuest } from '@/contexts/GuestContext';
import AddLink from '@/components/AddLink';
import LinksList from '@/components/LinksList';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/contexts/SupabaseContext';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { isGuestMode } = useGuest();
  const { user, loading } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!loading) {
          if (!user && !isGuestMode) {
            router.push('/auth/sign-in');
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (!isGuestMode) {
          router.push('/auth/sign-in');
        }
      }
    };

    checkAuth();
  }, [router, user, loading, isGuestMode]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we set up your workspace</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuestMode) {
    return null; // Let the redirect happen
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <AddLink />
        </div>
        <LinksList />
      </main>
    </div>
  );
}

