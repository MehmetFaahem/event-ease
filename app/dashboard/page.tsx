import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard - EventEase',
  description: 'Event management dashboard',
};

async function getStats() {
  try {
    const response = await fetch('http://localhost:3000/api/stats', {
      next: { revalidate: 60 }, // Revalidate every minute
      headers: {
        // Note: In a real app, you'd need to handle server-side auth token differently
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalEvents: 0,
      activeEvents: 0,
      totalAttendees: 0,
      registrationRate: 0,
    };
  }
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your event management activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            description="Total events created"
            icon={Calendar}
          />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCard
            title="Active Events"
            value={stats.activeEvents}
            description="Currently active events"
            icon={Clock}
          />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCard
            title="Total Attendees"
            value={stats.totalAttendees}
            description="Across all events"
            icon={Users}
          />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCard
            title="Registration Rate"
            value={`${stats.registrationRate}%`}
            description="Average registration rate"
            icon={TrendingUp}
          />
        </Suspense>
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
}