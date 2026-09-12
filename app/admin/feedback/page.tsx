import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { FeedbackManager } from "@/components/admin/FeedbackManager";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Feedback & Bug Reports | Admin",
};

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: feedbackList } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Student Feedback & Bug Reports
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review, investigate, and triage bugs, feature requests, and inquiries submitted by students.
        </p>
      </div>

      <FeedbackManager initialData={feedbackList || []} />
    </div>
  );
}
