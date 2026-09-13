import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { DonationsManager } from "@/components/admin/DonationsManager";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Donations & Supporters | Admin",
};

export default async function AdminDonationsPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Supporters & Donations
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage and recognize batchmates and supporters who contributed via UPI or Buy Me a Coffee.
        </p>
      </div>

      <DonationsManager initialDonations={donations || []} />
    </div>
  );
}
