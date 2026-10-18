"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Smartphone } from "lucide-react";

export default function SuttaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg text-text-muted text-sm">
          Loading...
        </div>
      }
    >
      <SuttaPageContent />
    </Suspense>
  );
}

function SuttaPageContent() {
  const searchParams = useSearchParams();

  const vpaParam = searchParams.get("vpa");
  const nmParam = searchParams.get("nm");
  const amtParam = searchParams.get("amt");

  const vpa = vpaParam?.trim() || "9825739419@NAVIAXIS";
  const nm = nmParam?.trim() || "Vipul";
  const defaultAmt = amtParam?.trim() || "20";

  const [amount, setAmount] = useState<string>(defaultAmt);

  useEffect(() => {
    if (amtParam?.trim()) {
      setAmount(amtParam.trim());
    }
  }, [amtParam]);

  const quickAmounts = ["10", "20", "50", "100"];

  const handlePay = () => {
    const numAmt = parseFloat(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      alert("Please enter a valid amount to proceed.");
      return;
    }

    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(
      nm
    )}&am=${amount}&cu=INR`;

    if (!isMobile) {
      alert("Please open this link on your mobile phone to pay via UPI.");
      return;
    }

    window.location.href = upiUrl;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 bg-bg transition-colors duration-200">
      <div className="w-full max-w-md bg-bg-elevated rounded-2xl shadow-sm border border-border p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-soft text-2xl mb-1 border border-border">
            🚬
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            🚬 Buy {nm} a Sutta
          </h1>
          <p className="text-xs text-text-muted">
            Paying to{" "}
            <span className="font-mono font-medium text-text bg-bg-subtle px-2 py-0.5 rounded border border-border">
              {vpa}
            </span>
          </p>
        </div>

        {/* Quick Select Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Select Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((val) => {
              const isSelected = amount === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition ${
                    isSelected
                      ? "bg-accent-soft border-accent text-accent-text ring-1 ring-accent"
                      : "bg-bg-subtle border-border text-text hover:bg-border/50"
                  }`}
                >
                  ₹{val}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label
            htmlFor="sutta-amount"
            className="text-xs font-semibold text-text-muted uppercase tracking-wider block"
          >
            Custom Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted font-bold text-base">
              ₹
            </span>
            <input
              id="sutta-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-bg border border-border text-text font-semibold text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
          </div>
        </div>

        {/* Pay Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePay}
            className="w-full py-3.5 px-6 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-base shadow-sm hover:shadow active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-5 h-5" />
            <span>Pay via UPI</span>
          </button>
        </div>

        {/* Joke / Warning Footer */}
        <div className="pt-2 border-t border-border/60">
          <p className="text-xs text-text-faint text-center italic">
            Warning: Suttas are injurious to health. Coded with love.
          </p>
        </div>
      </div>
    </div>
  );
}
