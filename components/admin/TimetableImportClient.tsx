"use client";

import { parsePdfAction, publishTimetableAction } from "@/app/actions/import";
import { ParsedScheduleRow, ParseResult } from "@/lib/pdf-parser/parser";
import { Subject, ClassType, BatchScope } from "@/types/database";
import { FileUp, Upload, CheckCircle2, AlertCircle, Trash2, Edit2, Send, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

interface TimetableImportClientProps {
  subjects: Subject[];
  initialStagedImport?: {
    id: string;
    file_name: string;
    month_year: string;
    status: string;
  } | null;
  initialRows?: ParsedScheduleRow[];
}

export function TimetableImportClient({
  subjects,
  initialStagedImport,
  initialRows = [],
}: TimetableImportClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(
    initialStagedImport
      ? {
          month_year: initialStagedImport.month_year,
          total_pages: 3,
          rows: initialRows,
          holidays: [],
          errors: [],
        }
      : null
  );
  const [editableRows, setEditableRows] = useState<ParsedScheduleRow[]>(initialRows);
  const [isParsing, startParsing] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleParse = () => {
    if (!file) return;
    setMessage(null);
    const formData = new FormData();
    formData.append("pdf_file", file);

    startParsing(async () => {
      try {
        const result = await parsePdfAction(formData);
        setParseResult(result);
        setEditableRows(result.rows);
      } catch (err: any) {
        setMessage({ text: err.message || "Failed to parse PDF", type: "error" });
      }
    });
  };

  const handleDeleteRow = (index: number) => {
    setEditableRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof ParsedScheduleRow, value: any) => {
    setEditableRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleApproveAll = () => {
    setEditableRows((prev) =>
      prev.map((r) => ({ ...r, parse_status: "VALID" as const }))
    );
    setMessage({
      text: "All rows have been marked as VALID. You may now click 'Confirm & Publish Schedule'.",
      type: "success",
    });
  };

  const handlePublish = () => {
    if (editableRows.length === 0) return;
    setMessage(null);

    startPublishing(async () => {
      try {
        const res = await publishTimetableAction(
          editableRows,
          parseResult?.month_year || initialStagedImport?.month_year || "September 2026",
          file?.name || initialStagedImport?.file_name || "AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026.pdf",
          initialStagedImport?.id
        );
        setMessage({
          text: `Successfully published ${res.count} verified classes to the student schedule!`,
          type: "success",
        });
        setParseResult(null);
        setEditableRows([]);
        setFile(null);
      } catch (err: any) {
        setMessage({ text: err.message || "Failed to publish schedule", type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Upload Teaching Schedule PDF</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />

          <button
            type="button"
            onClick={handleParse}
            disabled={!file || isParsing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting & Parsing...</span>
              </>
            ) : (
              <>
                <FileUp className="w-3.5 h-3.5" />
                <span>Extract & Preview</span>
              </>
            )}
          </button>
        </div>

        {file && (
          <p className="text-[11px] text-slate-400">
            Selected: <span className="font-mono text-slate-600">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Staged Preview Grid */}
      {editableRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Preview Staging Grid ({editableRows.length} sessions detected)
                </span>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  {parseResult?.month_year}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review and edit rows before committing to the live database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApproveAll}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-300 flex items-center justify-center gap-1.5"
                title="Mark all sessions as VALID for publication"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approve All</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Publish Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
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
                {editableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2.5 whitespace-nowrap font-mono text-slate-700 font-semibold">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleUpdateRow(idx, "date", e.target.value)}
                        className="bg-transparent border-0 p-0 text-xs font-mono font-semibold focus:ring-0"
                      />
                    </td>
                    <td className="p-2.5 whitespace-nowrap font-mono text-slate-500">
                      {row.start_time.slice(0, 5)} - {row.end_time.slice(0, 5)}
                    </td>
                    <td className="p-2.5 font-bold text-blue-700">
                      <select
                        value={row.subject_code}
                        onChange={(e) => handleUpdateRow(idx, "subject_code", e.target.value)}
                        className="text-xs font-bold text-blue-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                      >
                        <option value="UNKNOWN">UNKNOWN</option>
                        <option value="CLINICAL">CLINICAL</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.code}>{s.code}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5 max-w-[200px]">
                      <input
                        type="text"
                        value={row.topic}
                        onChange={(e) => handleUpdateRow(idx, "topic", e.target.value)}
                        className="w-full text-xs font-medium text-slate-900 bg-transparent border-0 p-0 focus:ring-0 truncate"
                      />
                    </td>
                    <td className="p-2.5 max-w-[150px]">
                      <input
                        type="text"
                        value={row.faculty || ""}
                        placeholder="Dr. Name"
                        onChange={(e) => handleUpdateRow(idx, "faculty", e.target.value)}
                        className="w-full text-xs text-slate-600 bg-transparent border-0 p-0 focus:ring-0 truncate"
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        value={row.class_type}
                        onChange={(e) => handleUpdateRow(idx, "class_type", e.target.value as ClassType)}
                        className="text-[11px] font-semibold bg-transparent border-0 p-0 focus:ring-0"
                      >
                        {["Lecture", "SDL", "Tutorial", "Practical", "Clinical Posting", "Seminar", "Integration", "Exam", "Other"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <select
                        value={row.batch_scope}
                        onChange={(e) => handleUpdateRow(idx, "batch_scope", e.target.value as BatchScope)}
                        className="text-[11px] font-semibold bg-transparent border-0 p-0 focus:ring-0"
                      >
                        <option value="ALL">ALL</option>
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Batch C">Batch C</option>
                      </select>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <select
                        value={row.parse_status}
                        onChange={(e) => handleUpdateRow(idx, "parse_status", e.target.value as "VALID" | "NEEDS_REVIEW")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:ring-0 ${
                          row.parse_status === "VALID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="VALID">VALID</option>
                        <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                      </select>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
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
      )}
    </div>
  );
}
