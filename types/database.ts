export type UserRole = "student" | "admin";

export type AttendanceStatus = "PRESENT" | "ABSENT";

export type TopicProgressStatus = "NOT_STARTED" | "LEARNING" | "COMPLETED";

export type ClassType =
  | "Lecture"
  | "SDL"
  | "Tutorial"
  | "Practical"
  | "Clinical Posting"
  | "Seminar"
  | "Integration"
  | "Exam"
  | "Other";

export type BatchScope = "ALL" | "Batch A" | "Batch B" | "Batch C";

export interface Batch {
  id: string;
  name: string;
  roll_min: number;
  roll_max: number;
  is_default_fallback: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  roll_number: string | null;
  batch_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
  batch?: Batch | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  color_code: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  created_at: string;
  updated_at: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  unit_id: string;
  topic_code?: string | null;
  title: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  user_progress?: TopicProgressStatus;
}

export interface StudentTopicProgress {
  id: string;
  student_id: string;
  topic_id: string;
  status: TopicProgressStatus;
  updated_at: string;
}

export interface ClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  subject_id: string | null;
  topic: string | null;
  faculty: string | null;
  venue: string | null;
  class_type: ClassType;
  batch_scope: BatchScope;
  notes: string | null;
  timetable_import_id?: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject | null;
  attendance_status?: AttendanceStatus | null;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  status: AttendanceStatus;
  marked_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  title: string;
  exam_date: string; // YYYY-MM-DD
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimetableImport {
  id: string;
  file_name: string;
  month_year: string;
  status: "STAGED" | "VALIDATED" | "PUBLISHED" | "FAILED";
  uploaded_by: string | null;
  created_at: string;
  published_at?: string | null;
}

export interface TimetableImportRow {
  id: string;
  import_id: string;
  date: string;
  start_time: string;
  end_time: string;
  subject_raw: string | null;
  subject_id: string | null;
  topic: string | null;
  faculty: string | null;
  venue: string | null;
  class_type: ClassType;
  batch_scope: BatchScope;
  parse_status: "VALID" | "NEEDS_REVIEW" | "UNKNOWN";
  notes?: string | null;
  is_deleted: boolean;
  created_at: string;
}

export interface SubjectAttendanceStat {
  subject_name: string;
  subject_code: string;
  color_code: string;
  avg_attendance_pct: number;
}

export interface SubjectAttendanceBucket {
  attended: number;
  total: number;
  percentage: number;
}

export interface StudentSubjectAttendance {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  color: string;
  is_split: boolean;
  attended: number;
  total: number;
  percentage: number;
  theory?: SubjectAttendanceBucket;
  practical?: SubjectAttendanceBucket;
}

export interface BatchAggregateStats {
  active_students_30d: number;
  batch_average_attendance_pct: number;
  subject_averages: SubjectAttendanceStat[];
}

export type HistoricalSubjectCode = "PATH" | "PHARMA" | "MICRO" | "FMT" | "CFM";

export interface StudentHistoricalAttendance {
  id: string;
  student_id: string;
  subject_code: HistoricalSubjectCode;
  theory_attended: number;
  theory_total: number;
  practical_attended: number;
  practical_total: number;
  is_one_time_set: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string | null;
}

export type RosterStatus = "UNCLAIMED" | "CLAIMED" | "DISABLED";

export interface StudentRosterEntry {
  id: string;
  roll_number: string;
  full_name: string | null;
  batch_id: string | null;
  claimed_by_user_id: string | null;
  status: RosterStatus;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  batch?: Batch | null;
  claimed_user?: {
    email: string;
    full_name: string | null;
  } | null;
}

