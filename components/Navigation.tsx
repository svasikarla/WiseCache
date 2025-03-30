'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useGuest } from '@/contexts/GuestContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useToast } from './ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Navigation() {
  const router = useRouter();
  const { isGuestMode, setIsGuestMode } = useGuest();
  const { user } = useSupabase();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      if (isGuestMode) {
        setIsGuestMode(false);
      } else {
        await supabase.auth.signOut();
      }
      router.push('/auth/sign-in');
      toast({
        title: "Success",
        description: isGuestMode ? "Exited guest mode" : "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">WiSECache</h1>
            {(user || isGuestMode) && (
              <span className="text-sm text-gray-500">
                {isGuestMode ? 'Guest Mode' : user?.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isGuestMode && (
              <Button
                variant="outline"
                onClick={() => router.push('/auth/sign-in')}
              >
                Sign In
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleSignOut}
            >
              {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 