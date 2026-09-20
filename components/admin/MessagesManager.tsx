"use client";

import { useState } from "react";
import { sendAdminMessageAction, deleteAdminMessageAction } from "@/app/actions/admin";
import { MessageSquare, Trash2, Send, CheckCircle2, ChevronDown, Bell } from "lucide-react";

export function MessagesManager({ students, messages }: { students: any[]; messages: any[] }) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !body) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("to_user_id", recipient);
    formData.append("subject", subject);
    formData.append("body", body);

    const res = await sendAdminMessageAction(formData);
    setLoading(false);

    if (res.success) {
      alert("Message sent!");
      setRecipient("");
      setSubject("");
      setBody("");
    } else {
      alert(res.error || "Failed to send message.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const res = await deleteAdminMessageAction(id);
    if (res.success) alert("Message deleted.");
    else alert(res.error || "Failed to delete.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-accent" />
          <span>Messages</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Send direct messages to students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleSend} className="bg-bg-elevated border border-[#EDE5D9] dark:border-[#2A2018] rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Send className="w-4 h-4 text-accent" /> Compose
            </h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Recipient</label>
              <select
                required
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg dark:bg-[#1A1510] text-text"
              >
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.roll_number} - {s.full_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Subject (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Attendance Warning"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg dark:bg-[#1A1510] text-text"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Message</label>
              <textarea
                required
                rows={5}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-bg dark:bg-[#1A1510] text-text resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Sent Messages */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-text-muted" /> Sent History
          </h2>
          {messages.length === 0 ? (
            <div className="p-8 text-center text-text-muted border border-[#EDE5D9] dark:border-[#2A2018] rounded-2xl bg-bg-elevated">
              No messages sent yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-bg-elevated border border-[#EDE5D9] dark:border-[#2A2018] rounded-2xl overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-bg/50 transition-colors"
                    onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}
                  >
                    <div>
                      <p className="text-xs font-bold text-accent mb-0.5">To: {msg.to_user?.roll_number} - {msg.to_user?.full_name}</p>
                      <p className="text-sm font-semibold text-text">{msg.subject || "No Subject"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {msg.is_read ? (
                        <div className="flex flex-col items-end">
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Read
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${expandedMsg === msg.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  
                  {expandedMsg === msg.id && (
                    <div className="p-4 border-t border-[#EDE5D9] dark:border-[#2A2018] bg-bg/50 space-y-4">
                      <p className="text-sm text-text whitespace-pre-wrap">{msg.body}</p>
                      <div className="flex justify-between items-center text-[10px] text-text-muted pt-2">
                        <span>Sent: {new Date(msg.created_at).toLocaleString()}</span>
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold p-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
