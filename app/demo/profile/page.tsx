import { demoStudent } from "@/lib/demo/mock-data";
import { Hash, Layers, Mail, LogOut, Shield } from "lucide-react";
import Link from "next/link";

export default function DemoProfilePage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Demo Student Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Simulated profile state for local UI preview
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-2 border-blue-200">
            DS
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{demoStudent.full_name}</h2>
            <p className="text-xs text-slate-500 font-mono">{demoStudent.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Demo Student Account
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>MBBS Roll Number</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-900">{demoStudent.roll_number}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Assigned Batch</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-800">
              {demoStudent.batch.name} ({demoStudent.batch.notes})
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Google Account</span>
            </div>
            <span className="text-xs text-slate-700 font-mono">{demoStudent.email}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <Link
            href="/demo/admin"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Shield className="w-4 h-4" />
            <span>Switch to Admin Preview (/demo/admin)</span>
          </Link>
          <Link
            href="/login"
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Demo Mode to /login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
