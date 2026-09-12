"use client";

import { useState, useTransition } from "react";
import { 
  updateFeedbackStatusAction, 
  deleteFeedbackAction 
} from "@/app/actions/admin";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  X,
  Loader2,
  Filter,
  Eye,
  Edit3,
  Mail,
  User,
  Archive,
  RefreshCw
} from "lucide-react";

export interface FeedbackItem {
  id: string;
  user_id: string | null;
  roll_number: string | null;
  email: string | null;
  category: "general" | "bug" | "feature" | "other";
  message: string;
  status: "NEW" | "REVIEWED" | "RESOLVED" | "ARCHIVED";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TABS = ["ALL", "NEW", "REVIEWED", "RESOLVED", "ARCHIVED"] as const;
type StatusTab = typeof STATUS_TABS[number];

export function FeedbackManager({ initialData }: { initialData: FeedbackItem[] }) {
  const [data, setData] = useState<FeedbackItem[]>(initialData);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>("NEW");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Status counts
  const counts = {
    ALL: data.length,
    NEW: data.filter((d) => d.status === "NEW").length,
    REVIEWED: data.filter((d) => d.status === "REVIEWED").length,
    RESOLVED: data.filter((d) => d.status === "RESOLVED").length,
    ARCHIVED: data.filter((d) => d.status === "ARCHIVED").length,
  };

  // Filter items
  const filteredItems = data.filter((item) => {
    if (activeTab !== "ALL" && item.status !== activeTab) return false;
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = item.roll_number?.toLowerCase().includes(q) ?? false;
      const matchEmail = item.email?.toLowerCase().includes(q) ?? false;
      const matchMsg = item.message?.toLowerCase().includes(q) ?? false;
      const matchNotes = item.admin_notes?.toLowerCase().includes(q) ?? false;
      if (!matchRoll && !matchEmail && !matchMsg && !matchNotes) return false;
    }
    return true;
  });

  const handleOpenModal = (item: FeedbackItem) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditNotes(item.admin_notes || "");
    setActionSuccess(null);
    setActionError(null);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setActionSuccess(null);
    setActionError(null);
  };

  const handleSaveModal = () => {
    if (!selectedItem) return;
    setActionSuccess(null);
    setActionError(null);

    startTransition(async () => {
      const res = await updateFeedbackStatusAction(selectedItem.id, editStatus, editNotes);
      if (res.success) {
        setData((prev) =>
          prev.map((it) =>
            it.id === selectedItem.id
              ? {
                  ...it,
                  status: editStatus as any,
                  admin_notes: editNotes,
                  updated_at: new Date().toISOString(),
                }
              : it
          )
        );
        setActionSuccess("Feedback status and notes updated successfully.");
        setTimeout(() => {
          handleCloseModal();
        }, 800);
      } else {
        setActionError(res.error || "Failed to update feedback.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this feedback entry?")) return;
    
    startTransition(async () => {
      const res = await deleteFeedbackAction(id);
      if (res.success) {
        setData((prev) => prev.filter((it) => it.id !== id));
        if (selectedItem?.id === id) {
          handleCloseModal();
        }
      } else {
        alert(res.error || "Failed to delete feedback entry.");
      }
    });
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "bug":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
            Bug
          </span>
        );
      case "feature":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50">
            Feature
          </span>
        );
      case "general":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50">
            General
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Other
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            New
          </span>
        );
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/50">
            <Eye className="w-3 h-3 text-blue-500" />
            Reviewed
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Archive className="w-3 h-3 text-slate-400" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar: Search + Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by roll number, email, message, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No feedback found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchQuery || categoryFilter !== "ALL" || activeTab !== "ALL"
                ? "Try clearing filters to see more entries."
                : "No student feedback has been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Message Preview</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        {item.roll_number ? (
                          <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                            {item.roll_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No roll</span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {item.email || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      {item.admin_notes && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 line-clamp-1 mt-0.5">
                          Note: {item.admin_notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition inline-flex items-center gap-1"
                          title="View and edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                          title="Delete feedback"
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

      {/* Detail / Edit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Feedback Details
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Submitted on {formatDate(selectedItem.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitter Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Roll Number
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {selectedItem.roll_number || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Category
                </span>
                <div className="mt-0.5">{getCategoryBadge(selectedItem.category)}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Email
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {selectedItem.email || "Anonymous user"}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Message Content
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedItem.message}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Update Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["NEW", "REVIEWED", "RESOLVED", "ARCHIVED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center border ${
                      editStatus === st
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Internal Admin Notes
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about actions taken, investigation status, etc..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Notification alert */}
            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDelete(selectedItem.id)}
                disabled={isPending}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs inline-flex items-center gap-1.5"
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
        </div>
      )}
    </div>
  );
}
