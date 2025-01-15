import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardEventLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-10 w-96" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-48" />
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
} 