"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClassSession, Subject, ClassType, BatchScope } from "@/types/database";
import { updateClassAction, deleteClassAction } from "@/app/actions/admin";
import { Pencil, Trash2, X, Loader2, Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";

interface AdminScheduleTableProps {
  initialClasses: ClassSession[];
  subjects: Subject[];
}

const CLASS_TYPES: ClassType[] = [
  "Lecture",
  "SDL",
  "Tutorial",
  "Practical",
  "Clinical Posting",
  "Seminar",
  "Integration",
  "Exam",
  "Other",
];

const BATCH_SCOPES: { value: BatchScope; label: string }[] = [
  { value: "ALL", label: "ALL (Full Batch)" },
  { value: "Batch A", label: "Batch A" },
  { value: "Batch B", label: "Batch B" },
  { value: "Batch C", label: "Batch C" },
];

export default function AdminScheduleTable({
  initialClasses,
  subjects,
}: AdminScheduleTableProps) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassSession[]>(initialClasses);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state for the active editing class
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    subject_id: "",
    topic: "",
    faculty: "",
    venue: "",
    class_type: "Lecture" as ClassType,
    batch_scope: "ALL" as BatchScope,
  });

  // Keep state in sync with server changes
  useEffect(() => {
    setClasses(initialClasses);
  }, [initialClasses]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editingClass) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingClass]);

  const handleOpenEdit = (c: ClassSession) => {
    setEditingClass(c);
    setErrorMessage(null);
    setFormData({
      date: c.date || "",
      start_time: c.start_time ? c.start_time.slice(0, 5) : "08:00",
      end_time: c.end_time ? c.end_time.slice(0, 5) : "09:00",
      subject_id: c.subject_id || "",
      topic: c.topic || "",
      faculty: c.faculty || "",
      venue: c.venue || "",
      class_type: c.class_type || "Lecture",
      batch_scope: c.batch_scope || "ALL",
    });
  };

  const handleCloseModal = () => {
    setEditingClass(null);
    setErrorMessage(null);
    setIsSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append("date", formData.date);
      data.append("start_time", formData.start_time);
      data.append("end_time", formData.end_time);
      data.append("subject_id", formData.subject_id);
      data.append("topic", formData.topic);
      data.append("faculty", formData.faculty);
      data.append("venue", formData.venue);
      data.append("class_type", formData.class_type);
      data.append("batch_scope", formData.batch_scope);

      const res = await updateClassAction(editingClass.id, data);

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update class session.");
        setIsSaving(false);
        return;
      }

      // Optimistic update of local row
      const matchedSubject = subjects.find((s) => s.id === formData.subject_id) || null;
      setClasses((prev) =>
        prev.map((item) =>
          item.id === editingClass.id
            ? {
                ...item,
                date: formData.date,
                start_time: `${formData.start_time}:00`,
                end_time: `${formData.end_time}:00`,
                subject_id: formData.subject_id || null,
                subject: matchedSubject,
                topic: formData.topic,
                faculty: formData.faculty || null,
                venue: formData.venue || null,
                class_type: formData.class_type,
                batch_scope: formData.batch_scope,
              }
            : item
        )
      );

      handleCloseModal();
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setIsSaving(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm("Are you sure you want to permanently delete this class?")) {
      return;
    }

    setDeletingId(classId);
    try {
      await deleteClassAction(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to delete class.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Scheduled Sessions ({classes.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Topic</th>
              <th className="p-3">Type & Batch</th>
              <th className="p-3">Faculty & Venue</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No scheduled classes found.
                </td>
              </tr>
            ) : (
              classes.map((c) => {
                const isDeleting = deletingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                      <div>{c.date}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.start_time ? c.start_time.slice(0, 5) : "—"} -{" "}
                        {c.end_time ? c.end_time.slice(0, 5) : "—"}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-blue-700">
                      {c.subject?.code || "—"}
                    </td>
                    <td className="p-3 font-medium text-slate-900 max-w-[220px] truncate" title={c.topic || ""}>
                      {c.topic || "—"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {c.class_type}
                      </span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        {c.batch_scope}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-500">
                      <div>{c.faculty || "—"}</div>
                      <div className="text-[11px] text-slate-400">{c.venue || "—"}</div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                          title="Edit class"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition disabled:opacity-50"
                          title="Delete class"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Class Modal */}
      {editingClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Scheduled Class
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update class details and curriculum assignment
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start Time</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          start_time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>End Time</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Subject</span>
                    </label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- General / Other --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Topic Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, topic: e.target.value }))
                      }
                      placeholder="e.g. Iron Deficiency Anemia"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Faculty</span>
                    </label>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, faculty: e.target.value }))
                      }
                      placeholder="e.g. Dr. Alok"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Venue</span>
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, venue: e.target.value }))
                      }
                      placeholder="e.g. Lecture Hall 2"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Class Type
                    </label>
                    <select
                      value={formData.class_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          class_type: e.target.value as ClassType,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {CLASS_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Batch Scope
                    </label>
                    <select
                      value={formData.batch_scope}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          batch_scope: e.target.value as BatchScope,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {BATCH_SCOPES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
