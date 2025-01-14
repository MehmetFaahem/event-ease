'use client';

import { useEffect, useState } from 'react';
import { EventList } from '@/components/events/event-list';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';

interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/events?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Replace with proper skeleton loader
  }

  return (
    <div className="space-y-6">
      <EventList
        events={events}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
} 