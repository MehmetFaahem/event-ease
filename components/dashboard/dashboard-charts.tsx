'use client';

import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface DashboardChartsProps {
  monthlyEvents: Array<{ month: string; count: number }>;
  eventsByStatus: {
    published: number;
    draft: number;
    cancelled: number;
  };
}

export function DashboardCharts({ monthlyEvents, eventsByStatus }: DashboardChartsProps) {
  const pieChartData = [
    { name: 'Published', value: eventsByStatus.published },
    { name: 'Draft', value: eventsByStatus.draft },
    { name: 'Cancelled', value: eventsByStatus.cancelled },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Events</CardTitle>
          <CardDescription>
            Number of events per month in {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyEvents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Status Distribution</CardTitle>
          <CardDescription>
            Distribution of events by their current status
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 