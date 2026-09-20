"use client";

import { useState, useMemo } from "react";
import { Search, Activity, Clock, MousePointerClick, ChevronRight, X } from "lucide-react";
import { getUserActivityLogAction } from "@/app/actions/admin";

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityTable({ students }: { students: any[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLog, setUserLog] = useState<any[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const filtered = useMemo(() => {
    let list = students;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => 
        (u.roll_number || "").toLowerCase().includes(s) ||
        (u.full_name || "").toLowerCase().includes(s)
      );
    }

    if (filter === "today") {
      const today = new Date().toDateString();
      list = list.filter(u => u.last_seen_at && new Date(u.last_seen_at).toDateString() === today);
    } else if (filter === "inactive") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(u => !u.last_seen_at || new Date(u.last_seen_at).getTime() < sevenDaysAgo);
    }

    // Sort by last seen by default
    list.sort((a,b) => {
      const tA = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      const tB = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      return tB - tA;
    });

    return list;
  }, [students, search, filter]);

  const openLog = async (user: any) => {
    setSelectedUser(user);
    setLoadingLog(true);
    const res = await getUserActivityLogAction(user.id);
    if (res.success) {
      setUserLog(res.log || []);
    } else {
      alert("Failed to load activity log");
    }
    setLoadingLog(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" />
          <span>User Activity</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Monitor engagement, last seen dates, and detailed activity logs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by roll or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg-elevated text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg-elevated text-text"
        >
          <option value="all">All Users</option>
          <option value="today">Seen Today</option>
          <option value="inactive">Inactive (&gt;7 Days)</option>
        </select>
      </div>

      <div className="rounded-2xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Last Seen</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Last Page</th>
                <th className="px-4 py-3 text-center font-semibold">Actions (30d)</th>
                <th className="px-4 py-3 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE5D9] dark:divide-[#2A2018]">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-text">{s.roll_number}</div>
                    <div className="text-xs text-text-muted">{s.full_name || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-text font-medium flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5 text-text-faint" />
                    {formatRelativeTime(s.last_seen_at)}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell font-mono truncate max-w-[150px]">
                    {s.last_page_visited || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent-soft text-accent-text dark:bg-accent/10">
                      {s.activity_last_30d}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => openLog(s)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      Log <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for detailed log */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-elevated w-full max-w-lg rounded-3xl border border-[#EDE5D9] dark:border-[#2A2018] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[#EDE5D9] dark:border-[#2A2018] flex items-center justify-between bg-bg-subtle">
              <div>
                <h3 className="font-bold text-text">Activity Log</h3>
                <p className="text-xs text-text-muted">{selectedUser.roll_number} - {selectedUser.full_name}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {loadingLog ? (
                <div className="text-center py-8 text-text-muted text-sm font-semibold animate-pulse">
                  Loading log...
                </div>
              ) : userLog.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No activity recorded for this user.
                </div>
              ) : (
                userLog.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm p-3 rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg/50">
                    <MousePointerClick className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text">{log.activity_type}</p>
                      <p className="text-xs text-text-muted font-mono mt-0.5">{log.page}</p>
                      <p className="text-[10px] text-text-faint mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
