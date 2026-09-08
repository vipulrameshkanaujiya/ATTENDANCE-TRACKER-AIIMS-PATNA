# Attendance Tracker by Vipul K

> **MBBS Utility Portal for Batch 2024 (Phase-2) · AIIMS Patna**  
> Simple, ultra-reliable, zero-maintenance student schedule, attendance tracker, and syllabus manager.

---

## 🚀 Key Features

1. **Google Authentication & Onboarding:**
   - Sign in with any Google account (no password handling, no whitelist required).
   - Enter your 5-digit roll number (`24___`, e.g., `24042`).
   - Dynamic batch allocation (Batch A: 1–40, Batch B: 41–80, Batch C: 81+).
2. **Student Dashboard ("My Day"):**
   - Live greeting with today's date.
   - High-contrast **Next Class** hero banner with 1-tap attendance.
   - Today's session timeline.
   - Subject-wise attendance breakdown vs NMC 75% threshold.
   - Dynamic **Pre-Prof Examination countdown**.
3. **Schedule & Timetable:**
   - Day, Week, and Month views.
   - Automatically filtered to sessions applicable to your batch (`ALL` + your batch).
4. **1-Tap Attendance Tracker:**
   - Large touch targets for `[Present]` / `[Absent]`.
   - Modifiable anytime with **no midnight restriction**.
   - Strict database-level isolation: students can never modify another student's attendance.
5. **Syllabus & Topic Tracker:**
   - Subject → Unit → Topic tree.
   - 3-state tactile toggle (`Not Started` → `Learning` → `Completed`).
   - Topic progress is completely independent of class attendance.
6. **Anonymous Batch Statistics:**
   - Cohort average attendance & subject benchmarks.
   - Strictly aggregate: **zero student names, emails, individual percentages, or leaderboards**.
7. **Timetable PDF Importer (Admin Console):**
   - Upload official monthly schedule PDF (`AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026.pdf`).
   - Extraction → Parsing → Normalization → Interactive Staging Preview.
   - Full admin correction grid (edit subjects, faculty, venue, delete holidays) before publishing.
8. **Admin Control Panel (`/admin`):**
   - Strictly guarded for single owner: `vipulrameshkanaujiya@gmail.com`.
   - Manage scheduled classes, subjects, units, topics, exam dates, and batch roll ranges without touching source code.

---

## 🛠️ Technology Architecture

- **Frontend & Backend:** Next.js 15+ (App Router, Server Actions, React 19, TypeScript)
- **Styling:** Tailwind CSS (Mobile-first, clean clinical aesthetic)
- **Database & Auth:** Supabase (Managed PostgreSQL 16+ with Row Level Security & Google OAuth)
- **PDF Engine:** Deterministic Serverless Parser (`pdf-parse`)
- **Hosting:** Vercel (Free tier, zero server management)

---

## 📦 Setup & Deployment Guide

### 1. Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
   - This sets up all 11 tables, indexes, Row Level Security policies, seed subjects, dynamic batches, and aggregate statistics functions.

### 2. Google OAuth Configuration
1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Configure an OAuth 2.0 Client ID for Web Applications:
   - **Authorized JavaScript Origins:**
     - `http://localhost:3000`
     - `https://your-app-name.vercel.app`
   - **Authorized Redirect URIs:**
     - `http://localhost:3000/api/auth/callback`
     - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
     - `https://your-app-name.vercel.app/api/auth/callback`
3. Enter the Client ID and Secret in Supabase Auth > Providers > Google.

### 3. Environment Variables
Create `.env.local` (or add in Vercel Project Settings):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Server-only!
ADMIN_EMAIL=vipulrameshkanaujiya@gmail.com
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 4. Deploying to Vercel
1. Push the repository to GitHub.
2. Import the repository into [vercel.com](https://vercel.com).
3. Add the 5 environment variables from above.
4. Click **Deploy**. Your app is live with automatic SSL on `https://your-app-name.vercel.app`.
