'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface Link {
  id: string;
  url: string;
  title: string;
  summary: string;
  categories: string[];
  created_at: string;
}

interface GuestContextType {
  guestLinks: Link[];
  addGuestLink: (link: Link) => void;
  removeGuestLink: (id: string) => void;
  isGuestMode: boolean;
  setIsGuestMode: (value: boolean) => void;
  canAddMoreLinks: boolean;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestLinks, setGuestLinks] = useState<Link[]>([]);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Load guest links from localStorage on mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('guestLinks');
    if (savedLinks) {
      setGuestLinks(JSON.parse(savedLinks));
    }
  }, []);

  // Save guest links to localStorage when they change
  useEffect(() => {
    localStorage.setItem('guestLinks', JSON.stringify(guestLinks));
  }, [guestLinks]);

  const addGuestLink = (link: Link) => {
    setGuestLinks(prev => [...prev, link]);
  };

  const removeGuestLink = (id: string) => {
    setGuestLinks(prev => prev.filter(link => link.id !== id));
  };

  const canAddMoreLinks = guestLinks.length < 5;

  return (
    <GuestContext.Provider 
      value={{ 
        guestLinks, 
        addGuestLink,
        removeGuestLink,
        isGuestMode, 
        setIsGuestMode,
        canAddMoreLinks
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
} 