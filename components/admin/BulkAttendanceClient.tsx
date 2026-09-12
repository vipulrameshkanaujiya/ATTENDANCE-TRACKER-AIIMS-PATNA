"use client";

import { useState, useTransition } from "react";
import { uploadBulkAttendanceAction, deleteBulkRowAction, clearAllBulkAction } from "@/app/actions/admin";
import { FileSpreadsheet, Upload, Trash2, AlertCircle, CheckCircle2, Loader2, Download } from "lucide-react";

export function BulkAttendanceClient({ currentData }: { currentData: any[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Group current data by roll_number for display
  const groupedData = currentData.reduce((acc: any, row: any) => {
    if (!acc[row.roll_number]) acc[row.roll_number] = [];
    acc[row.roll_number].push(row);
    return acc;
  }, {});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selected);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Check header
    const header = lines[0].toLowerCase();
    if (!header.includes("roll_number")) {
      setParseErrors(["Invalid CSV header. Please use the template."]);
      return;
    }

    const dataLines = lines.slice(1);
    const rows: any[] = [];
    const errs: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const separator = dataLines[i].includes(";") ? ";" : ",";
      const cols = dataLines[i].split(separator).map(c => c.trim());
      if (cols.length < 7) {
        // Fallback for old format without name (6 columns)
        if (cols.length === 6) {
          const [roll_number, subject_code, theory_attended, theory_total, practical_attended, practical_total] = cols;
          rows.push({
            roll_number,
            name: "",
            subject_code: subject_code.toUpperCase(),
            theory_attended: parseInt(theory_attended) || 0,
            theory_total: parseInt(theory_total) || 0,
            practical_attended: parseInt(practical_attended) || 0,
            practical_total: parseInt(practical_total) || 0,
          });
        }
        continue;
      }

      const [roll_number, name, subject_code, theory_attended, theory_total, practical_attended, practical_total] = cols;
      
      const tA = parseInt(theory_attended) || 0;
      const tT = parseInt(theory_total) || 0;
      const pA = parseInt(practical_attended) || 0;
      const pT = parseInt(practical_total) || 0;

      rows.push({
        roll_number,
        name,
        subject_code: subject_code.toUpperCase(),
        theory_attended: tA,
        theory_total: tT,
        practical_attended: pA,
        practical_total: pT,
      });
    }

    setParsedRows(rows);
    setParseErrors(errs);
    setServerErrors([]);
  };

  const handleUpload = () => {
    setServerErrors([]);
    startTransition(async () => {
      try {
        const res = await uploadBulkAttendanceAction(parsedRows);
        if (!res.success) {
          setServerErrors(res.errors || ["Unknown error"]);
        } else {
          alert(`Successfully uploaded ${res.uploaded} rows.`);
          setFile(null);
          setParsedRows([]);
        }
      } catch (err: any) {
        setServerErrors([err.message]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            Upload CSV
          </h2>
          <a href="/templates/bulk-attendance-template.csv" download className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <Download className="w-4 h-4" /> Template
          </a>
        </div>

        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300 cursor-pointer"
          />
        </div>

        {parseErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900/50">
            {parseErrors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        {serverErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900/50 max-h-40 overflow-y-auto">
            {serverErrors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Parsed {parsedRows.length} rows (Previewing first 5)
              </span>
              <button 
                onClick={handleUpload}
                disabled={isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm & Upload
              </button>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-2">Roll</th>
                    <th className="p-2">Subj</th>
                    <th className="p-2">Th Att</th>
                    <th className="p-2">Th Tot</th>
                    <th className="p-2">Pr Att</th>
                    <th className="p-2">Pr Tot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono">{r.roll_number}</td>
                      <td className="p-2 font-bold">{r.subject_code}</td>
                      <td className="p-2">{r.theory_attended}</td>
                      <td className="p-2">{r.theory_total}</td>
                      <td className="p-2">{r.practical_attended}</td>
                      <td className="p-2">{r.practical_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Current Bulk Data ({Object.keys(groupedData).length} students)
          </h2>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to delete ALL bulk data?")) {
                startTransition(() => clearAllBulkAction());
              }
            }}
            disabled={isPending || currentData.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition"
          >
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3">Roll</th>
                <th className="p-3">Subjects (Th / Pr)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(groupedData).map(([roll, rows]: [string, any]) => (
                <tr key={roll} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{roll}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {rows.map((r: any) => (
                        <span key={r.subject_code} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px]">
                          <strong className="text-slate-700 dark:text-slate-300">{r.subject_code}</strong>
                          <span className="text-slate-500">T:{r.theory_attended}/{r.theory_total}</span>
                          <span className="text-slate-500">P:{r.practical_attended}/{r.practical_total}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => {
                        if (confirm(`Delete bulk data for ${roll}?`)) {
                          startTransition(() => deleteBulkRowAction(roll));
                        }
                      }}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {Object.keys(groupedData).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">No bulk data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
