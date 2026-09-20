"use client";

import { completeOnboarding } from "@/app/actions/auth";
import { isValidRollNumber, getRollNumberSuffix } from "@/lib/utils/batch";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, UserCheck } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingClient() {
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const trimmedRoll = rollNumber.trim();
  const isValid = isValidRollNumber(trimmedRoll);
  const rollSuffix = getRollNumberSuffix(trimmedRoll);

  // Dynamic preview for user feedback
  let previewBatch = "";
  if (isValid) {
    if (trimmedRoll.startsWith("21") || trimmedRoll.startsWith("22") || trimmedRoll.startsWith("23")) {
      previewBatch = "Batch C (Old Students)";
    } else if (rollSuffix !== null) {
      if (rollSuffix >= 1 && rollSuffix <= 40) {
        previewBatch = "Batch A (Roll 01–40)";
      } else if (rollSuffix >= 41 && rollSuffix <= 80) {
        previewBatch = "Batch B (Roll 41–80)";
      } else {
        previewBatch = "Batch C (Roll 81 onwards)";
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please enter a valid 5-digit roll number (e.g. 24042 or 22064)");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append("roll_number", trimmedRoll);

    startTransition(async () => {
      const res = await completeOnboarding(formData);
      if (res && !res.success && res.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-bg">
      <div className="w-full max-w-md bg-bg-elevated rounded-2xl shadow-sm border border-border p-8 space-y-7">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-soft text-accent-text mb-1 border border-border">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-text tracking-tight">
            Student Onboarding
          </h1>
          <p className="text-xs text-text-muted">
            Enter your 5-digit MBBS roll number to link your timetable & attendance records.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="roll_number"
              className="block text-xs font-semibold uppercase tracking-wider text-text"
            >
              MBBS Roll Number
            </label>
            <div className="relative">
              <input
                id="roll_number"
                name="roll_number"
                type="text"
                maxLength={5}
                placeholder="24___"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value.trim());
                  setError(null);
                }}
                className="w-full px-4 py-3.5 text-lg font-mono font-semibold tracking-widest text-text bg-bg border border-border rounded-xl focus:bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
              />
              {isValid && (
                <div className="absolute right-3.5 top-3.5 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-text-faint">
              Format: 5 digits (e.g., 24001, 24040, 22064)
            </p>
          </div>

          {/* Dynamic Batch Preview Pill */}
          {previewBatch && (
            <div className="p-3.5 rounded-xl bg-accent-soft border border-border flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-text flex-shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-accent-text">
                  Automatic Batch Allocation
                </p>
                <p className="text-sm font-semibold text-accent-text">
                  {previewBatch}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <span>{isPending ? "Setting up your profile..." : "Confirm & Enter Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-[11px] text-text-faint">
            Verified against the official AIIMS Patna MBBS 2024 roster. Each roll number can only be claimed once.
          </p>
        </div>

      </div>
    </div>
  );
}
