"use client";

import { useState } from "react";
import { demoTodayClasses } from "@/lib/demo/mock-data";
import { Plus, Trash2, Calendar, Clock, MapPin, User } from "lucide-react";

export default function DemoAdminSchedulePage() {
  const [classes, setClasses] = useState(demoTodayClasses);
  const [newTopic, setNewTopic] = useState("");

  const handleDelete = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic) return;
    const newClass = {
      id: `c-new-${Date.now()}`,
      date: "2026-09-08",
      start_time: "08:00:00",
      end_time: "09:00:00",
      subject_code: "PHARMA",
      subject_name: "Pharmacology",
      topic: newTopic,
      faculty: "Dr. Rajesh",
      venue: "Lecture Hall 2",
      class_type: "Lecture" as const,
      batch_scope: "ALL" as const,
      attendance_status: null,
    };
    setClasses((prev) => [newClass, ...prev]);
    setNewTopic("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Schedule & Class Sessions
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Add or modify sessions manually (Local Preview Mode)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add New Scheduled Class</span>
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Date</label>
            <input type="date" defaultValue="2026-09-08" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Time</label>
            <input type="text" defaultValue="08:00 - 09:00" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Subject</label>
            <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg">
              <option value="PATH">Pathology (PATH)</option>
              <option value="PHARMA">Pharmacology (PHARMA)</option>
              <option value="MICRO">Microbiology (MICRO)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Class Type</label>
            <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg">
              <option value="Lecture">Lecture</option>
              <option value="Practical">Practical</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold text-slate-700">Topic Title</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Antifungal Drugs - I"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Add Session
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Scheduled Sessions ({classes.length})
        </h2>

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
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                    <div>{c.date}</div>
                    <div className="text-[11px] text-slate-400">{c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</div>
                  </td>
                  <td className="p-3 font-bold text-blue-700">{c.subject_code}</td>
                  <td className="p-3 font-medium text-slate-900">{c.topic}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700">{c.class_type}</span>
                    <span className="text-slate-400 block text-[11px]">{c.batch_scope}</span>
                  </td>
                  <td className="p-3 text-slate-500">{c.faculty} · {c.venue}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete class"
                    >
                      <Trash2 className="w-4 h-4" />
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
