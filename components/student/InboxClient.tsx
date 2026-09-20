"use client";

import { useState } from "react";
import { markMessageReadAction } from "@/app/actions/student";
import { MessageSquare, Bell, ChevronDown } from "lucide-react";

export function InboxClient({ messages: initialMessages }: { messages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleMessage = async (msg: any) => {
    const isExpanding = expandedId !== msg.id;
    setExpandedId(isExpanding ? msg.id : null);

    if (isExpanding && !msg.is_read) {
      // Optimistic update
      setMessages(prev =>
        prev.map(m => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
      await markMessageReadAction(msg.id);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <div className="w-16 h-16 rounded-full bg-[#F2ECE3] dark:bg-[#241C14] flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-[#A89E92]" />
        </div>
        <p className="text-sm font-semibold">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          <span>Inbox</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Updates and messages from the admin.</p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const isExpanded = expandedId === msg.id;
          return (
            <div
              key={msg.id}
              className={`rounded-2xl border transition-all overflow-hidden cursor-pointer ${
                !msg.is_read
                  ? "border-accent/40 bg-accent/5 dark:bg-accent/10"
                  : "border-[#EDE5D9] dark:border-[#2A2018] bg-bg-elevated"
              }`}
              onClick={() => toggleMessage(msg)}
            >
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                    )}
                    <h3 className={`text-sm font-semibold ${!msg.is_read ? "text-text" : "text-text-muted"}`}>
                      {msg.subject || "Message from Admin"}
                    </h3>
                  </div>
                  <p className="text-[10px] text-text-faint">
                    {new Date(msg.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 text-sm text-text whitespace-pre-wrap leading-relaxed border-t border-[#EDE5D9]/50 dark:border-[#2A2018]/50 mt-2 pt-3">
                  {msg.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
