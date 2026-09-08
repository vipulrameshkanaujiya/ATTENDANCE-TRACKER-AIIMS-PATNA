"use client";

import { useState } from "react";
import { FileUp, Upload, CheckCircle2, AlertCircle, Trash2, Send, Check } from "lucide-react";

const sampleParsedRows = [
  { id: 1, date: "2026-09-01", time: "10:00 - 13:00", subject: "CLINICAL", topic: "Clinical Postings / Bedside Clinics", faculty: "All Consultants", venue: "Hospital Wards", type: "Clinical Posting", batch: "ALL", status: "VALID" },
  { id: 2, date: "2026-09-01", time: "08:00 - 09:00", subject: "PHARMA", topic: "Antitubercular Drugs - II", faculty: "Dr. Alok", venue: "Lecture Hall 2", type: "Lecture", batch: "ALL", status: "VALID" },
  { id: 3, date: "2026-09-01", time: "09:00 - 10:00", subject: "MICRO", topic: "Hepatitis virus", faculty: "Dr. Binod", venue: "Lecture Hall 2", type: "Lecture", batch: "ALL", status: "VALID" },
  { id: 4, date: "2026-09-01", time: "14:00 - 16:00", subject: "PATH", topic: "CNS Neoplasms", faculty: "Dr. Ishrat Jahan", venue: "Department Lab", type: "Practical", batch: "Batch A", status: "VALID" },
  { id: 5, date: "2026-09-01", time: "14:00 - 16:00", subject: "PHARMA", topic: "Pharmacy (Revision)", faculty: "Dr. Saurav (Mod: Dr. Sunil)", venue: "Department Lab", type: "Practical", batch: "Batch B", status: "VALID" },
  { id: 6, date: "2026-09-01", time: "14:00 - 16:00", subject: "MICRO", topic: "Lab diagnosis of Vibrio", faculty: "Dr. Pooja (SR)", venue: "Department Lab", type: "Practical", batch: "Batch C", status: "VALID" },
  { id: 7, date: "2026-09-04", time: "ALL DAY", subject: "HOLIDAY", topic: "FRIDAY — HOLIDAY (Non-Teaching Day)", faculty: "—", venue: "—", type: "Other", batch: "ALL", status: "VALID" },
  { id: 8, date: "2026-09-05", time: "10:00 - 12:00", subject: "PATH", topic: "Rheumatoid Arthritis (Immunology & Criteria)", faculty: "Dr. Protik Mondal", venue: "Lecture Hall 2", type: "Integration", batch: "ALL", status: "VALID" },
];

export default function DemoAdminImportPage() {
  const [rows, setRows] = useState(sampleParsedRows);
  const [published, setPublished] = useState(false);

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Timetable PDF Importer
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Simulated extraction for AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026.pdf
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Upload Teaching Schedule PDF</span>
        </h2>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">
              AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              236.7 KB · 3 Pages · AIIMS Patna Phase-2 MBBS
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Parsed Successfully
          </span>
        </div>
      </div>

      {published && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo Action Confirmed: Schedule successfully published to simulated database!</span>
        </div>
      )}

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Preview Staging Grid ({rows.length} sessions detected)
            </h2>
            <p className="text-xs text-slate-500">
              Review and edit rows before confirming publication to student schedule
            </p>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Confirm & Publish Schedule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Subject</th>
                <th className="p-2.5">Topic</th>
                <th className="p-2.5">Faculty</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Batch</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono whitespace-nowrap">{r.date}</td>
                  <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">{r.time}</td>
                  <td className="p-2.5 font-bold text-blue-700">{r.subject}</td>
                  <td className="p-2.5 max-w-[200px] truncate font-medium text-slate-900">{r.topic}</td>
                  <td className="p-2.5 text-slate-500 max-w-[140px] truncate">{r.faculty}</td>
                  <td className="p-2.5">{r.type}</td>
                  <td className="p-2.5 font-semibold text-slate-700">{r.batch}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 transition"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
