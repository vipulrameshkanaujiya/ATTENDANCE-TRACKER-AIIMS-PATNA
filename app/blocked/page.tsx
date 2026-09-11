import { ShieldAlert } from "lucide-react";
import { getAdminEmail } from "@/lib/auth/constants";

export const metadata = {
  title: "Access Revoked | Attendance Tracker",
};

export default function BlockedPage() {
  const adminEmail = getAdminEmail();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access Revoked</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your access to this application has been revoked by the administrator.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            If you believe this is a mistake, please contact the admin for assistance:
          </p>
          <a 
            href={`mailto:${adminEmail}`}
            className="mt-2 inline-block font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
          >
            {adminEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
