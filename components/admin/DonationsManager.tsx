"use client";

import { useState, useTransition } from "react";
import { addDonationAction, deleteDonationAction, updateDonationAction } from "@/app/actions/admin";
import { Heart, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Pencil } from "lucide-react";

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

  // Edit Modal states
  const [editingDonation, setEditingDonation] = useState<DonationItem | null>(null);
  const [editForm, setEditForm] = useState<{
    donor_name: string;
    amount: number | null;
    message: string | null;
    is_public: boolean;
  }>({
    donor_name: "",
    amount: null,
    message: null,
    is_public: true,
  });

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

  const handleOpenEdit = (item: DonationItem) => {
    setEditingDonation(item);
    setEditForm({
      donor_name: item.donor_name,
      amount: item.amount,
      message: item.message,
      is_public: item.is_public,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDonation) return;
    if (!editForm.donor_name.trim()) {
      alert("Donor name is required.");
      return;
    }

    startTransition(async () => {
      const res = await updateDonationAction(editingDonation.id, {
        donor_name: editForm.donor_name.trim(),
        amount: editForm.amount !== null && !isNaN(editForm.amount) ? editForm.amount : null,
        message: editForm.message?.trim() || null,
        is_public: editForm.is_public,
      });

      if (res.success) {
        setDonations((prev) =>
          prev.map((d) =>
            d.id === editingDonation.id
              ? {
                  ...d,
                  donor_name: editForm.donor_name.trim(),
                  amount: editForm.amount !== null && !isNaN(editForm.amount) ? editForm.amount : null,
                  message: editForm.message?.trim() || null,
                  is_public: editForm.is_public,
                }
              : d
          )
        );
        setEditingDonation(null);
        setSuccessMsg("Donation updated successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("Error: " + res.error);
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
      <div className="bg-bg-elevated border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-accent dark:text-accent flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">
              Record a Supporter / Donation
            </h3>
            <p className="text-[11px] text-text-muted">
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
                className="w-full px-3.5 py-2 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                className="w-full px-3.5 py-2 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
                className="w-full px-3.5 py-2 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-pink-500 border-slate-300 dark:border-slate-700"
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
      <div className="bg-bg-elevated border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent dark:text-accent fill-accent" />
            <h3 className="text-sm font-bold text-text">
              Supporters & Donations ({donations.length})
            </h3>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-accent dark:text-accent flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No supporters recorded yet
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              When students or batchmates support BunkBuddy via UPI or Buy Me a Coffee, add them above. The thank-you card on Home will only appear when at least one supporter exists.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[...donations]
                  .sort((a, b) => {
                    const amtA = a.amount ?? -1;
                    const amtB = b.amount ?? -1;
                    if (amtB !== amtA) return amtB - amtA;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  })
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-text-muted whitespace-nowrap font-mono text-[11px]">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 font-bold text-text">
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Edit donation"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.donor_name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete donation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Donation Modal */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-bg-elevated rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-text">
                Edit Donation
              </h3>
              <button
                type="button"
                onClick={() => setEditingDonation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Donor Name *
                </label>
                <input
                  type="text"
                  value={editForm.donor_name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, donor_name: e.target.value }))}
                  className="w-full px-3.5 py-2 mt-1 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      amount: e.target.value === "" ? null : parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3.5 py-2 mt-1 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Tip: If the same user donated multiple times, update this to the cumulative amount.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  value={editForm.message ?? ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={2}
                  className="w-full px-3.5 py-2 mt-1 bg-bg dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-public"
                  checked={editForm.is_public}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, is_public: e.target.checked }))}
                  className="w-4 h-4 rounded text-accent focus:ring-pink-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label htmlFor="edit-public" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Show publicly on Home & Help pages
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDonation(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isPending || !editForm.donor_name.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
