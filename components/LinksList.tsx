'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useGuest } from "@/contexts/GuestContext";
import { Trash2, Search, SlidersHorizontal, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Database } from '@/types/supabase';

type DatabaseLink = Database['public']['Tables']['links']['Row'];

type LinkState = DatabaseLink[];

type SortOption = 'newest' | 'oldest' | 'title';

const ITEMS_PER_PAGE = 10;

export default function LinksList() {
  const { toast } = useToast();
  const [links, setLinks] = useState<DatabaseLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const { isGuestMode, guestLinks, removeGuestLink } = useGuest();
  const supabase = createClientComponentClient<Database>();

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/links');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch links');
      }

      const data = await response.json();
      setLinks(data.map((link: any) => ({
        id: link.id,
        user_id: link.user_id,
        url: link.url,
        title: link.title,
        summary: link.summary,
        categories: link.categories,
        created_at: link.created_at,
        updated_at: link.updated_at
      })));
    } catch (error) {
      console.error('Error fetching links:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch links';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete link';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  useEffect(() => {
    if (isGuestMode) {
      setLinks(guestLinks);
      setLoading(false);
    } else {
      fetchLinks();
    }
  }, [isGuestMode, guestLinks]);

  // Get unique categories from all links
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    links.forEach(link => {
      link.categories?.forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [links]);

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    return links
      .filter(link => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' ||
          link.title?.toLowerCase().includes(searchLower) ||
          link.url.toLowerCase().includes(searchLower) ||
          link.summary?.toLowerCase().includes(searchLower);

        // Category filter
        const matchesCategories = 
          selectedCategories.length === 0 || 
          selectedCategories[0] === 'all' ||
          selectedCategories.some(cat => link.categories?.includes(cat));

        return matchesSearch && matchesCategories;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'title':
            return (a.title ?? '').localeCompare(b.title ?? '');
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [links, searchQuery, selectedCategories, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredLinks.length / ITEMS_PER_PAGE);
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, sortBy]);

  // Sort function
  const sortLinks = (a: DatabaseLink, b: DatabaseLink) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'title':
        return (a.title ?? '').localeCompare(b.title ?? '');
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  };

  // Export function
  const handleExport = async (format: 'markdown' | 'json' | 'csv') => {
    try {
      let content = '';
      let filename = '';
      let type = '';

      if (format === 'markdown') {
        content = links.map(link => (
          `# ${link.title || 'Untitled'}\n` +
          `URL: ${link.url}\n` +
          (link.summary ? `Summary: ${link.summary}\n` : '') +
          (link.categories?.length ? `Categories: ${link.categories.join(', ')}\n` : '') +
          `Added: ${new Date(link.created_at).toLocaleDateString()}\n\n`
        )).join('');
        filename = 'links-export.md';
        type = 'text/markdown';
      } else if (format === 'json') {
        content = JSON.stringify(links, null, 2);
        filename = 'links-export.json';
        type = 'application/json';
      } else {
        const csvContent = [
          ['Title', 'URL', 'Summary', 'Categories', 'Created At'],
          ...links.map(link => [
            `"${(link.title || '').replace(/"/g, '""')}"`,
            `"${link.url.replace(/"/g, '""')}"`,
            `"${(link.summary || '').replace(/"/g, '""')}"`,
            `"${(link.categories || []).join(', ').replace(/"/g, '""')}"`,
            `"${new Date(link.created_at).toISOString()}"`
          ]).map(row => row.join(','))
        ];
        content = csvContent.join('\n');
        filename = 'links-export.csv';
        type = 'text/csv';
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Links exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting links:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export links",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Rest of the component content */}
    </div>
  );
}