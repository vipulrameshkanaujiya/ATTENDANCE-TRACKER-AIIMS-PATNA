"use client";

import React, { useState, useTransition } from "react";
import {
  BookOpen,
  MessageSquare,
  Coffee,
  LogIn,
  Hash,
  Calendar,
  CheckSquare,
  Bot,
  BarChart3,
  Target,
  AlertCircle,
  Shield,
  Zap,
  TrendingUp,
  Moon,
  Smartphone,
  ChevronDown,
  Check,
  Copy,
  Send,
  Loader2,
  ExternalLink,
  Mail,
  Heart,
} from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/student";

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function HelpPageClient({
  profile,
  donations = [],
  donationCount = 0,
}: {
  profile: { roll_number?: string; email?: string } | null;
  donations?: any[];
  donationCount?: number;
}) {
  // Feedback form state
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Copy UPI state
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = async () => {
    const upiId = "9825739419@NAVIAXIS";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(upiId);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = upiId;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        textarea.style.top = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setFeedbackError("Please write at least 5 characters.");
      return;
    }

    setFeedbackError(null);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("message", message.trim());

    startTransition(async () => {
      const res = await submitFeedbackAction(formData);
      if (res.success) {
        setFeedbackSuccess(true);
        setMessage("");
        setCategory("general");
        setTimeout(() => setFeedbackSuccess(false), 5000);
      } else {
        setFeedbackError(res.error || "Failed to submit feedback. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-12">
      {/* SECTION A: HERO */}
      <section className="text-center pt-4 pb-2 space-y-4">
        <div className="inline-block relative">
          <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="BunkBuddy Logo"
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-xl mx-auto object-cover border-2 border-indigo-200 dark:border-indigo-900/50"
          />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            BunkBuddy
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Your attendance companion for AIIMS Patna MBBS 2024
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              Built by Vipul K
            </span>
          </div>
        </div>
      </section>

      {/* SECTION B: QUICK ACTIONS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <a
          href="#how-to-use"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs flex flex-col items-center text-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">How to Use</span>
        </a>

        <a
          href="#feedback"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs flex flex-col items-center text-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Feedback</span>
        </a>

        <a
          href="#support"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 transition shadow-xs flex flex-col items-center text-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Support</span>
        </a>

        <a
          href="https://github.com/vipulrameshkanaujiya/ATTENDANCE-TRACKER-AIIMS-PATNA"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition shadow-xs flex flex-col items-center text-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center group-hover:scale-110 transition">
            <GithubIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            GitHub <ExternalLink className="w-3 h-3 text-slate-400" />
          </span>
        </a>
      </section>

      {/* SECTION C: HOW TO USE */}
      <section id="how-to-use" className="space-y-4 scroll-mt-20">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📖 How to Use BunkBuddy</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Everything you need to master your MBBS Phase-2 attendance tracking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              step: 1,
              title: "Sign in with Google",
              desc: "Use your official AIIMS or personal Google account for seamless authentication.",
              icon: LogIn,
            },
            {
              step: 2,
              title: "Claim your roll number",
              desc: "Enter your 5-digit roll number (e.g., 24052). Both regular 24xxx and legacy rolls (21xxx, 22xxx, 23xxx) are accepted.",
              icon: Hash,
            },
            {
              step: 3,
              title: "View today's sessions",
              desc: "The Home page immediately shows your timetable with subject codes, timings, and venues.",
              icon: Calendar,
            },
            {
              step: 4,
              title: "Mark attendance in 1 tap",
              desc: "Tap Present or Absent for conducted sessions. Changes save instantly with optimistic UI.",
              icon: CheckSquare,
            },
            {
              step: 5,
              title: "Enable Auto-Present mode",
              desc: "Turns on automatic attendance marking for all past classes. Just tap Absent manually if you bunked.",
              icon: Bot,
            },
            {
              step: 6,
              title: "Track your progress",
              desc: "View live subject-wise percentages (Pathology, Pharmacology, Microbiology, FMT, CFM) on your dashboard.",
              icon: BarChart3,
            },
            {
              step: 7,
              title: "Path to 76% calculation",
              desc: "The Attendance tab projects future classes and tells you exactly how many sessions you must attend to stay safe.",
              icon: Target,
            },
            {
              step: 8,
              title: "Report issues & feedback",
              desc: "Spot a clerical error or have a feature idea? Send a note directly to admin using the feedback form below.",
              icon: MessageSquare,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                  {item.step}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION D: FEATURES GRID */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>✨ Features & Capabilities</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed specifically for the MBBS curriculum workflow at AIIMS Patna
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: "Secure Login",
              desc: "Google OAuth ensures only verified accounts have access. Your identity is tamper-proof.",
              icon: Shield,
              color: "text-blue-500",
            },
            {
              title: "Instant Marking",
              desc: "1-tap optimistic UI updates your progress bars in real-time with zero network lag.",
              icon: Zap,
              color: "text-amber-500",
            },
            {
              title: "Auto-Present Mode",
              desc: "Never lose percentage because you forgot to log in. Automatically marks past classes present.",
              icon: Bot,
              color: "text-emerald-500",
            },
            {
              title: "Smart Analytics",
              desc: "Comprehensive benchmarks and anonymous cohort statistics across MBBS Batch 2024.",
              icon: TrendingUp,
              color: "text-purple-500",
            },
            {
              title: "Path to 76%",
              desc: "Accurately predicts required classes to clear NMC 75% criteria with a 1% safety buffer.",
              icon: Target,
              color: "text-rose-500",
            },
            {
              title: "Live Schedule",
              desc: "Interactive Day, Week, and Month timetable synced with academic notifications.",
              icon: Calendar,
              color: "text-indigo-500",
            },
            {
              title: "Dark Mode",
              desc: "Sleek slate dark palette tailored for night-time studying and battery saving.",
              icon: Moon,
              color: "text-cyan-500",
            },
            {
              title: "Installable PWA",
              desc: "Add to your Android or iPhone home screen for an offline-capable, app-like experience.",
              icon: Smartphone,
              color: "text-teal-500",
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${feat.color}`} />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION E: FAQ ACCORDION */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>❓ Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick answers to common questions about roll numbers, attendance, and privacy
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              q: "Why can't I change my roll number?",
              a: "To prevent roll spoofing and unauthorized attendance modifications, each roll number is permanently bound to the Google account that claims it. If you claimed an incorrect roll number by mistake, please contact an Admin to reset it.",
            },
            {
              q: "What is Auto-Present mode?",
              a: "Auto-Present is an automation mode that marks all past conducted classes as 'Present' for you. If you missed a class, you can still open the app anytime and manually flip that session to 'Absent'.",
            },
            {
              q: "What if my attendance data looks wrong?",
              a: "For ongoing semester classes, you can simply tap the Present/Absent button on the Schedule tab. For pre-September baseline data, it is permanently locked once saved; please submit a ticket using the Feedback form below to request an admin correction.",
            },
            {
              q: "Can I use BunkBuddy offline?",
              a: "Yes — partially. If you install BunkBuddy as a PWA (Add to Home Screen), you can: view your last-fetched attendance, schedule, and stats offline with an offline indicator. Note that marking new attendance while offline is not yet supported (V1 limitation) and Auto-Present runs on the server so it needs internet. When you reconnect, BunkBuddy automatically syncs fresh data.",
            },
            {
              q: "How do I install BunkBuddy on my phone?",
              a: "On Android: Open the website in Google Chrome, tap the 3 dots in the top right corner, and select 'Install app'. On iOS (iPhone): Open in Safari, tap the Share button at the bottom, and select 'Add to Home Screen'.",
            },
            {
              q: "Who can see my personal attendance record?",
              a: "Only you and designated system administrators can view your individual roll number and attendance percentage. Other batchmates only see anonymized, aggregate cohort statistics on the Stats page.",
            },
            {
              q: "Is BunkBuddy an official AIIMS Patna app?",
              a: "No. BunkBuddy is an independent, open-source utility created by Vipul K for MBBS Batch 2024 to help batchmates track their academic standing easily. It is not an official release from the AIIMS administration.",
            },
          ].map((item, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all open:shadow-xs"
            >
              <summary className="flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 cursor-pointer select-none list-none">
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Q:</span>
                  {item.q}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" />
              </summary>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* SECTION F: FEEDBACK FORM */}
      <section id="feedback" className="space-y-4 scroll-mt-20">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>💬 Send Feedback or Report a Bug</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your ideas and bug reports help make BunkBuddy better for the whole batch
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6">
          {feedbackSuccess && (
            <div className="mb-5 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold">
                ✓ Feedback submitted successfully! The admin team will review it. Thank you!
              </p>
            </div>
          )}

          {feedbackError && (
            <div className="mb-5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">💬 General Feedback</option>
                <option value="bug">🐛 Report a Bug / Wrong Attendance</option>
                <option value="feature">✨ Feature Request</option>
                <option value="other">📝 Other Query</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {message.length} / 500
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Explain the bug, ask a question, or suggest a new feature..."
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Submitted as: <strong className="font-mono text-slate-600 dark:text-slate-300">{profile?.roll_number || "Guest"}</strong> ({profile?.email || "Signed in"})
              </p>
              <button
                type="submit"
                disabled={isPending || message.trim().length < 5}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION G: SUPPORT THE DEVELOPER */}
      <section id="support" className="space-y-4 scroll-mt-20">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>☕ Support the Developer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            BunkBuddy is free, ad-free, and always will be.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-6 shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>If BunkBuddy saved your attendance...</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Countless hours went into writing the timetable engine, attendance algorithms, automated scripts, and UI. If this app helped ease your attendance stress, treating me to a chai or coffee is warmly appreciated!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            {/* UPI QR Code Container */}
            <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center gap-2">
              <img
                src="/upi-qr.png"
                alt="UPI QR Code - 9825739419@NAVIAXIS"
                className="w-52 h-52 object-contain rounded-xl"
              />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Scan with any UPI App
              </p>
            </div>

            {/* UPI ID Copy & Buy Me A Coffee Button */}
            <div className="space-y-4 flex-1 w-full text-center sm:text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Direct UPI ID
                </label>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 select-all">
                    9825739419@NAVIAXIS
                  </span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {/* Buy Me a Coffee button */}
                <a
                  href="https://buymeacoffee.com/vipulk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFDD00] hover:bg-[#FFD000] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Buy me a coffee ☕</span>
                </a>

                {/* Get Me Chai button */}
                <a
                  href="https://getmechai.vercel.app/link.html?vpa=9825739419@NAVIAXIS&nm=Vipul&amt=10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition hover:scale-105"
                  title="Buy me a Chai (₹10)"
                >
                  <img
                    src="https://i.ibb.co/Xkdj83y/image-2.png"
                    alt="Buy me a Chai"
                    className="h-12 w-auto rounded-2xl border-2 border-[#3e2e21]"
                    style={{ borderRadius: "20px" }}
                  />
                </a>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center sm:text-left mt-2">
                UPI · Buy Me a Coffee · Get Me Chai — choose whichever is easiest for you 💛
              </p>

              {donationCount > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                    <span>Recent Supporters ({donationCount})</span>
                  </p>
                  <div className="space-y-1.5">
                    {donations.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {d.donor_name}
                        </span>
                        <div className="flex items-center gap-2">
                          {d.message && (
                            <span className="text-[11px] italic text-slate-500 dark:text-slate-400">
                              "{d.message}"
                            </span>
                          )}
                          {d.amount && (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              ₹{d.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION H: OPEN SOURCE */}
      <section className="space-y-4">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🐙 BunkBuddy is Open Source</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Built with Next.js 15, Supabase, Tailwind CSS, and TypeScript under the MIT License.
            </p>
          </div>
          <a
            href="https://github.com/vipulrameshkanaujiya/ATTENDANCE-TRACKER-AIIMS-PATNA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 font-bold text-xs transition shadow-sm shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>⭐ Star on GitHub</span>
          </a>
        </div>
      </section>

      {/* SECTION I: FOOTER */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-2 text-xs text-slate-400 dark:text-slate-500">
        <p className="font-medium text-slate-600 dark:text-slate-400">
          Made with 🩺 by Vipul K · AIIMS Patna MBBS 2024
        </p>
        <p className="text-[11px]">
          Version 1.0 · MIT License
        </p>
        <p className="text-[11px] pt-1">
          For bugs or urgent issues:{" "}
          <a
            href="mailto:vipulrameshkanaujiya@gmail.com"
            className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700"
          >
            vipulrameshkanaujiya@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
