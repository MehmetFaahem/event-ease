import { Suspense } from 'react';
import { Metadata } from 'next';
import { MyEventList } from '@/components/events/my-event-list';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Events - Dashboard',
  description: 'View and manage your created events',
};

export default async function MyEventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Events</h2>
          <p className="text-muted-foreground">
            View and manage events you have created.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
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
        <MyEventList />
      </Suspense>
    </div>
  );
}
