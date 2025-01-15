import { Suspense } from 'react';
import { Metadata } from 'next';
import { EventList } from '@/components/events/event-list';
import { EventSearch } from '@/components/events/event-search';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Events - EventEase',
  description: 'Browse and discover events',
};

async function getEvents(searchParams: { page?: string; search?: string }) {
  const params = new URLSearchParams({
    page: searchParams.page || '1',
    limit: '9',
    search: searchParams.search || '',
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/events?${params}`,
    {
      next: { revalidate: 60 }, // Cache for 60 seconds
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground">
          Discover and join amazing events in your area.
        </p>
        <EventSearch />
      </div>

      <Suspense 
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        }
      >
        <EventList searchParams={searchParams} />
      </Suspense>
    </div>
  );
} 