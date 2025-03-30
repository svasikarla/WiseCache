'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useGuest } from "@/contexts/GuestContext";
import { v4 as uuidv4 } from 'uuid';

function isValidUrl(urlString: string) {
  try {
    // Add protocol if missing
    const urlToTest = urlString.startsWith('http://') || urlString.startsWith('https://')
      ? urlString
      : `https://${urlString}`;
    
    const url = new URL(urlToTest);
    return url.hostname.includes('.'); // Basic check for valid domain
  } catch {
    return false;
  }
}

function normalizeUrl(urlString: string) {
  // Add https:// if no protocol is specified
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return `https://${urlString}`;
  }
  return urlString;
}

export default function AddLink() {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isGuestMode, addGuestLink, canAddMoreLinks } = useGuest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    const normalizedUrl = normalizeUrl(url.trim());
    
    if (!isValidUrl(normalizedUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., example.com or https://example.com)",
        variant: "destructive",
      });
      return;
    }

    if (isGuestMode && !canAddMoreLinks) {
      toast({
        title: "Error",
        description: "You've reached the guest limit of 5 links. Please sign in to add more!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          isGuestMode 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add link');
      }

      const data = await response.json();

      if (isGuestMode) {
        // Add the link to guest storage
        addGuestLink({
          ...data,
          id: uuidv4(), // Generate a unique ID for guest links
          created_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Success",
        description: "Link added successfully!",
      });

      // Reset form
      setUrl('');
      setIsInputVisible(false);
      
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGuestMode && !canAddMoreLinks) {
    return (
      <div className="text-center py-4 text-destructive">
        You've reached the guest limit of 5 links. Please sign in to add more!
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!isInputVisible ? (
        <Button 
          onClick={() => setIsInputVisible(true)}
          className="w-full"
        >
          + Add Link {isGuestMode && `(${5 - (canAddMoreLinks ? 5 : 0)} remaining)`}
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="url"
                placeholder="Enter URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                required
                pattern="https?://.*"
              />
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Save'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsInputVisible(false);
                    setUrl('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 