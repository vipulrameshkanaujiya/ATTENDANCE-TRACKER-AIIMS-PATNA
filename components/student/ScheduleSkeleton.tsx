import { Skeleton } from "@/components/ui/Skeleton";

export function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Date Navigation Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          {/* Today button */}
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>

        {/* Date Selector Row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5 flex flex-col items-center">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Class List Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-14 space-y-1.5 flex-shrink-0 pt-1">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-3 space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
              <div className="flex justify-end sm:justify-start">
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
