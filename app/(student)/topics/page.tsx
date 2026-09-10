"use client";

import { useSearchParams } from "next/navigation";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { TopicStatusPill } from "@/components/student/TopicStatusPill";
import { BookOpen, CheckCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function TopicsPage() {
  const searchParams = useSearchParams();
  const { dashboardData, deferredData, isLoading } = useStudentData();

  const metrics = useMemo(() => {
    if (!dashboardData || !deferredData) return null;
    const { allSubjects: subjects } = dashboardData;
    const { units: allUnits, progressRecords } = deferredData;

    const activeSubjectId = searchParams.get("subject") || subjects?.[0]?.id || "";

    const units = allUnits.filter((u: any) => u.subject_id === activeSubjectId);

    const progressMap: Record<string, "NOT_STARTED" | "LEARNING" | "COMPLETED"> = {};
    (progressRecords || []).forEach((p: any) => {
      progressMap[p.topic_id] = p.status;
    });

    let totalTopics = 0;
    let completedTopics = 0;
    let learningTopics = 0;

    (units || []).forEach((u: any) => {
      (u.topics || []).forEach((t: any) => {
        totalTopics++;
        const st = progressMap[t.id] || "NOT_STARTED";
        if (st === "COMPLETED") completedTopics++;
        if (st === "LEARNING") learningTopics++;
      });
    });

    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return { subjects, activeSubjectId, units, progressMap, totalTopics, completedTopics, learningTopics, completionPct };
  }, [dashboardData, deferredData, searchParams]);

  if (isLoading || !metrics || !dashboardData || !deferredData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading curriculum...</p>
      </div>
    );
  }

  const { subjects, activeSubjectId, units, progressMap, totalTopics, completedTopics, learningTopics, completionPct } = metrics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Syllabus & Topic Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Personal learning progress (independent of class attendance)
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(subjects || []).map((sub: any) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <Link
              key={sub.id}
              href={`/topics?subject=${sub.id}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </div>

      {/* Progress Metric Banner */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Subject Progress
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {completionPct}% <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">completed</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            {completedTopics} done · {learningTopics} in progress · {totalTopics - completedTopics - learningTopics} unstarted
          </p>
        </div>

        <div className="w-full sm:w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Units & Topics Hierarchy */}
      <div className="space-y-4">
        {(units || []).length > 0 ? (
          units!.map((unit: any) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    Unit {unit.unit_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {unit.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {unit.topics?.length || 0} topics
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
                {(unit.topics || []).map((topic: any) => {
                  const currentStatus = progressMap[topic.id] || "NOT_STARTED";
                  return (
                    <div
                      key={topic.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 rounded-xl transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {topic.topic_code && (
                            <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                              {topic.topic_code}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {topic.title}
                          </p>
                        </div>
                      </div>

                      <div className="self-end sm:self-auto">
                        <TopicStatusPill
                          topicId={topic.id}
                          initialStatus={currentStatus}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No syllabus units listed for this subject yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              The administrator can configure units and topics in the Admin Dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
