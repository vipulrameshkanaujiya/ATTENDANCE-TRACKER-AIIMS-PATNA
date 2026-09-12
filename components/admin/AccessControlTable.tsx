"use client";

import { useState } from "react";
import { blockUserAction, unblockUserAction, forceLogoutUserAction, removeUserAction, wipeUserAccountAction } from "@/app/actions/admin";
import { ShieldAlert, ShieldX, LogOut, UserX, UserCheck, Search, Trash2, Eraser } from "lucide-react";
import { ChangeRollModal } from "./ChangeRollModal";

export function AccessControlTable({ initialBlocked, allUsers }: { initialBlocked: any[], allUsers: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [blockForm, setBlockForm] = useState({ email: "", rollNumber: "", reason: "" });

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await blockUserAction(blockForm);
      setBlockForm({ email: "", rollNumber: "", reason: "" });
      alert("Block applied successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleUnblock = async (id: string) => {
    if (!confirm("Are you sure you want to unblock this user?")) return;
    setIsPending(true);
    try {
      await unblockUserAction(id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleForceLogout = async (userId: string) => {
    if (!confirm("Force logout this user? They will need to sign in again.")) return;
    setIsPending(true);
    try {
      await forceLogoutUserAction(userId);
      alert("User logged out.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleWipeTest = async (userId: string, email: string) => {
    const confirmed = prompt(
      "This will PERMANENTLY delete:\n" +
      "- The student's Gmail auth account\n" +
      "- All their attendance data\n" +
      "- Their profile\n" +
      "- Their roll claim (roll becomes available again)\n\n" +
      "Type their email to confirm:"
    );
    if (confirmed !== email) {
      alert("Email did not match. Cancelled.");
      return;
    }
    setIsPending(true);
    const result = await wipeUserAccountAction(userId);
    setIsPending(false);
    if (!result.success) {
      alert("Error: " + result.error);
    } else {
      alert("Test account wiped. Roll is now available for re-claim.");
      window.location.reload();
    }
  };

  const handleRemove = async (userId: string, roll: string | null) => {
    const confirmRoll = prompt(`This will permanently delete the user's data.\nType their roll number to confirm (${roll || "unknown"}):`);
    if (confirmRoll !== roll) {
      alert("Roll number did not match. Removal cancelled.");
      return;
    }
    setIsPending(true);
    try {
      await removeUserAction(userId);
      alert("User permanently removed.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.roll_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Add Pre-emptive Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Block (Pre-emptive)</h2>
        </div>
        <form onSubmit={handleBlockSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
            <input 
              type="email" 
              value={blockForm.email} 
              onChange={e => setBlockForm(prev => ({...prev, email: e.target.value}))}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="e.g. student@aiimspatna.org"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Roll Number</label>
            <input 
              type="text" 
              value={blockForm.rollNumber} 
              onChange={e => setBlockForm(prev => ({...prev, rollNumber: e.target.value}))}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="e.g. 24001"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reason (Optional)</label>
            <input 
              type="text" 
              value={blockForm.reason} 
              onChange={e => setBlockForm(prev => ({...prev, reason: e.target.value}))}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="e.g. Suspended"
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending || (!blockForm.email && !blockForm.rollNumber)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            Block Access
          </button>
        </form>
      </div>

      {/* 2. Currently Blocked */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Currently Blocked Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Identifier</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Blocked At</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialBlocked.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{b.email || b.roll_number}</div>
                    <div className="text-xs text-slate-500">{b.email && b.roll_number ? `${b.roll_number} (${b.email})` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{b.reason || "-"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{new Date(b.blocked_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleUnblock(b.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
              {initialBlocked.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No blocked users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. All Students */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Registered Students</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search roll, email, name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Roll</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(u => {
                const isBlocked = initialBlocked.some(b => (b.email && b.email === u.email) || (b.roll_number && b.roll_number === u.roll_number) || (b.user_id === u.id));
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{u.roll_number || "-"}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{u.full_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ChangeRollModal studentId={u.id} currentRoll={u.roll_number} />
                        {isBlocked ? (
                          <span className="px-2 py-1 text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">Blocked</span>
                        ) : (
                          <button 
                            onClick={async () => {
                              setIsPending(true);
                              try {
                                await blockUserAction({ email: u.email, rollNumber: u.roll_number || undefined });
                                alert("User blocked.");
                              } catch(e:any) { alert(e.message); }
                              setIsPending(false);
                            }}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                          >
                            <ShieldX className="w-3.5 h-3.5" /> Block
                          </button>
                        )}
                        <button 
                          onClick={() => handleForceLogout(u.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                        <button 
                          onClick={() => handleRemove(u.id, u.roll_number)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                        <button 
                          onClick={() => handleWipeTest(u.id, u.email)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 rounded-lg transition"
                          title="Wipe Test Account (deletes auth user, resets roll)"
                        >
                          <Eraser className="w-3.5 h-3.5" /> Wipe Test
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
