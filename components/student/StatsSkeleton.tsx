import { Skeleton } from "@/components/ui/Skeleton";

export function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-40 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      {/* Privacy Notice Banner Skeleton */}
      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
        <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
        <Skeleton className="h-4 w-full rounded" />
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        ))}
      </div>

      {/* Subject-Wise Batch Benchmarks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-3 w-56 rounded" />
        </div>

        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-10 rounded" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
