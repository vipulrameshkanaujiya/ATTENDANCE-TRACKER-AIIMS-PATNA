import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/session";
import { TopicStatusPill } from "@/components/student/TopicStatusPill";
import { BookOpen, CheckCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

interface TopicsPageProps {
  searchParams: Promise<{
    subject?: string;
  }>;
}

export default async function TopicsPage({ searchParams }: TopicsPageProps) {
  const { profile } = await requireOnboarded();
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Fetch all subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("display_order", { ascending: true });

  const activeSubjectId = params.subject || subjects?.[0]?.id || "";

  // 2. Fetch units and topics for active subject
  const { data: units } = await supabase
    .from("units")
    .select("*, topics(*)")
    .eq("subject_id", activeSubjectId)
    .order("unit_number", { ascending: true });

  // 3. Fetch current student's progress
  const { data: progressRecords } = await supabase
    .from("student_topic_progress")
    .select("topic_id, status")
    .eq("student_id", profile?.id || "");

  const progressMap: Record<string, "NOT_STARTED" | "LEARNING" | "COMPLETED"> = {};
  (progressRecords || []).forEach((p: any) => {
    progressMap[p.topic_id] = p.status;
  });

  // Calculate subject progress stats
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Syllabus & Topic Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Personal learning progress (independent of class attendance)
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(subjects || []).map((sub) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <Link
              key={sub.id}
              href={`/topics?subject=${sub.id}`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </div>

      {/* Progress Metric Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Subject Progress
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {completionPct}% <span className="text-xs font-semibold text-slate-500">completed</span>
          </p>
          <p className="text-xs text-slate-500 pt-0.5">
            {completedTopics} done · {learningTopics} in progress · {totalTopics - completedTopics - learningTopics} unstarted
          </p>
        </div>

        <div className="w-full sm:w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
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
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    Unit {unit.unit_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {unit.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {unit.topics?.length || 0} topics
                </span>
              </div>

              <div className="divide-y divide-slate-100 p-2">
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
                            <span className="text-[11px] font-mono font-semibold text-slate-400">
                              {topic.topic_code}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-slate-800">
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
          <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No syllabus units listed for this subject yet.</p>
            <p className="text-xs text-slate-400">
              The administrator can configure units and topics in the Admin Dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
