"use client";

import { useState, useTransition } from "react";
import { addDonationAction, deleteDonationAction } from "@/app/actions/admin";
import { Heart, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export interface DonationItem {
  id: string;
  donor_name: string;
  amount: number | null;
  currency: string;
  message: string | null;
  is_public: boolean;
  created_at: string;
}

export function DonationsManager({ initialDonations }: { initialDonations: DonationItem[] }) {
  const [donations, setDonations] = useState<DonationItem[]>(initialDonations);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      setErrorMsg("Donor name is required.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("donor_name", donorName.trim());
      if (amount.trim()) formData.set("amount", amount.trim());
      if (message.trim()) formData.set("message", message.trim());
      if (isPublic) formData.set("is_public", "on");

      const res = await addDonationAction(formData);
      if (res.success) {
        setSuccessMsg("Donation added successfully.");
        setDonorName("");
        setAmount("");
        setMessage("");
        setIsPublic(true);

        // Optimistically prepend to list
        const newItem: DonationItem = {
          id: crypto.randomUUID(),
          donor_name: donorName.trim(),
          amount: amount.trim() ? parseFloat(amount.trim()) : null,
          currency: "INR",
          message: message.trim() || null,
          is_public: isPublic,
          created_at: new Date().toISOString(),
        };
        setDonations((prev) => [newItem, ...prev]);

        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Failed to add donation.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the donation from "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteDonationAction(id);
      if (res.success) {
        setDonations((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(res.error || "Failed to delete donation.");
      }
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Donation Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Record a Supporter / Donation
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Add someone who supported BunkBuddy via UPI or Buy Me a Coffee.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Donor Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Aryan Sharma"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amount (₹ INR, Optional)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Message / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Thanks for BunkBuddy!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 dark:border-slate-700"
              />
              <span>Display publicly on Home & Help pages</span>
            </label>

            <button
              type="submit"
              disabled={isPending || !donorName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Supporter</span>
                </>
              )}
            </button>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Donations List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400 fill-pink-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Supporters & Donations ({donations.length})
            </h3>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No supporters recorded yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              When students or batchmates support BunkBuddy via UPI or Buy Me a Coffee, add them above. The thank-you card on Home will only appear when at least one supporter exists.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {donations.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.donor_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.amount ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{item.amount}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unspecified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate">
                      {item.message || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.is_public ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          Private
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id, item.donor_name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                        title="Delete donation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
