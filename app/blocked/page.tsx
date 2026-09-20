import { ShieldAlert } from "lucide-react";
import { getAdminEmail } from "@/lib/auth/constants";

export const metadata = {
  title: "Access Revoked | Attendance Tracker",
};

export default function BlockedPage() {
  const adminEmail = getAdminEmail();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-[#0F0C09] p-4">
      <div className="max-w-md w-full bg-bg-elevated rounded-2xl border border-red-200 dark:border-red-900/30 shadow-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text">Access Revoked</h1>
          <p className="text-slate-600 dark:text-[#A89E92]">
            Your access to this application has been revoked by the administrator.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-[#2A2018]">
          <p className="text-sm font-medium text-slate-600 dark:text-[#A89E92]">
            If you believe this is a mistake, please contact the admin for assistance:
          </p>
          <a 
            href={`mailto:${adminEmail}`}
            className="mt-2 inline-block font-bold text-accent hover:text-accent-text dark:text-accent-text dark:hover:text-blue-300 transition"
          >
            {adminEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
