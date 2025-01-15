import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { UserModel } from '@/lib/models/user.model';
import { env } from '@/lib/config/env';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { CalendarDays, Users, Calendar, TrendingUp } from 'lucide-react';

async function getDashboardData() {
  await connectDB();

  // Get overall statistics
  const totalEvents = await EventModel.countDocuments();
  const totalUsers = await UserModel.countDocuments();
  
  // Get active events (upcoming and ongoing)
  const now = new Date();
  const activeEvents = await EventModel.countDocuments({
    date: { $gte: now },
    status: 'published',
  });

  // Get total registrations
  const events = await EventModel.find().lean();
  const totalRegistrations = events.reduce(
    (sum, event) => sum + (event.currentAttendees || 0),
    0
  );

  // Get events by status
  const eventsByStatus = {
    published: await EventModel.countDocuments({ status: 'published' }),
    draft: await EventModel.countDocuments({ status: 'draft' }),
    cancelled: await EventModel.countDocuments({ status: 'cancelled' }),
  };

  // Get monthly event counts for the current year
  const currentYear = new Date().getFullYear();
  const monthlyEvents = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const start = startOfMonth(new Date(currentYear, i));
      const end = endOfMonth(new Date(currentYear, i));
      const count = await EventModel.countDocuments({
        date: { $gte: start, $lte: end },
      });
      return {
        month: format(new Date(currentYear, i), 'MMM'),
        count,
      };
    })
  );

  // Get recent activity
  const recentEvents = await EventModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('organizer', 'name')
    .lean();

  // Get top events by registration
  const topEvents = await EventModel.find()
    .sort({ currentAttendees: -1 })
    .limit(5)
    .lean();

  return {
    totalEvents,
    totalUsers,
    activeEvents,
    totalRegistrations,
    eventsByStatus,
    monthlyEvents,
    recentEvents,
    topEvents,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming and ongoing events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Event registrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div>Loading charts...</div>}>
        <DashboardCharts
          monthlyEvents={data.monthlyEvents}
          eventsByStatus={data.eventsByStatus}
        />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {event.organizer}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.currentAttendees} attendees
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}