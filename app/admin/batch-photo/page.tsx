"use client";

import { useState } from "react";
import { uploadBatchPhotoAction, deleteBatchPhotoAction } from "@/app/actions/admin";
import { Camera, Upload, Trash2 } from "lucide-react";

export default function BatchPhotoAdminPage() {
  const [isPending, setIsPending] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await uploadBatchPhotoAction(formData);
    setIsPending(false);
    
    if (!result.success) {
      alert("Error: " + result.error);
    } else {
      alert("Batch photo updated successfully!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to reset the batch photo to default?")) return;
    setIsPending(true);
    const result = await deleteBatchPhotoAction();
    setIsPending(false);
    
    if (!result.success) {
      alert("Error: " + result.error);
    } else {
      alert("Batch photo reset to default.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-600" />
          Batch Photo
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a new batch photo to display on the students' home page.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Photo (JPG/PNG, max 5MB)
            </label>
            <input 
              type="file" 
              name="photo" 
              accept="image/jpeg, image/png, image/webp" 
              required
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Caption (optional)
            </label>
            <input 
              type="text" 
              name="caption" 
              placeholder="e.g. MBBS Batch 2024 — AIIMS Patna"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-semibold transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Reset to Default
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
