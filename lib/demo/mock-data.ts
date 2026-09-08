export interface DemoClass {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  subject_code: string;
  subject_name: string;
  topic: string;
  faculty: string;
  venue: string;
  class_type: string;
  batch_scope: string;
  attendance_status: "PRESENT" | "ABSENT" | null;
}

export const demoStudent = {
  id: "demo-student-id",
  email: "demo.student@aiims.edu",
  role: "student" as const,
  roll_number: "24001",
  full_name: "Demo Student (AIIMS Patna)",
  batch_id: "batch-a",
  is_onboarded: true,
  avatar_url: null,
  batch: {
    id: "batch-a",
    name: "Batch A",
    roll_min: 1,
    roll_max: 40,
    is_default_fallback: false,
    notes: "Roll No. 01 to 40",
  },
};

export const demoExam = {
  id: "exam-preprof",
  title: "PRE-PROF",
  exam_date: "2026-11-04",
  description: "2nd Professional MBBS Pre-Professional Examination",
  days_left: 58,
};

export const demoTodayClasses: DemoClass[] = [
  {
    id: "c-today-1",
    date: "2026-09-07",
    start_time: "08:00:00",
    end_time: "09:00:00",
    subject_code: "PATH",
    subject_name: "Pathology",
    topic: "Hypersensitivity Reaction",
    faculty: "Dr. Madhu Kumari",
    venue: "Lecture Hall 2",
    class_type: "Lecture",
    batch_scope: "ALL",
    attendance_status: "PRESENT",
  },
  {
    id: "c-today-2",
    date: "2026-09-07",
    start_time: "09:00:00",
    end_time: "10:00:00",
    subject_code: "PHARMA",
    subject_name: "Pharmacology",
    topic: "Anthelmintic Drugs",
    faculty: "Dr. Shruti",
    venue: "Lecture Hall 2",
    class_type: "Lecture",
    batch_scope: "ALL",
    attendance_status: "PRESENT",
  },
  {
    id: "c-today-3",
    date: "2026-09-07",
    start_time: "10:00:00",
    end_time: "13:00:00",
    subject_code: "CLINICAL",
    subject_name: "Clinical Posting",
    topic: "General Medicine & Surgery Bedside Clinic",
    faculty: "Duty Consultants & SRs",
    venue: "Hospital Wards",
    class_type: "Clinical Posting",
    batch_scope: "ALL",
    attendance_status: "PRESENT",
  },
  {
    id: "c-today-4",
    date: "2026-09-07",
    start_time: "14:00:00",
    end_time: "16:00:00",
    subject_code: "PATH",
    subject_name: "Pathology",
    topic: "CNS infections & Diseases",
    faculty: "Dr. Ankit Sandilya",
    venue: "Pathology Histology Lab",
    class_type: "Tutorial",
    batch_scope: "Batch A",
    attendance_status: null,
  },
];

export const demoAttendanceStats = {
  overall_percentage: 84,
  total_attended: 42,
  total_classes: 50,
  subjects: [
    { code: "PATH", name: "Pathology", percentage: 84, attended: 16, total: 19, color: "bg-blue-600" },
    { code: "PHARMA", name: "Pharmacology", percentage: 88, attended: 15, total: 17, color: "bg-emerald-600" },
    { code: "MICRO", name: "Microbiology", percentage: 79, attended: 11, total: 14, color: "bg-amber-600" },
    { code: "MED", name: "Medicine", percentage: 87, attended: 7, total: 8, color: "bg-cyan-600" },
    { code: "CFM", name: "Community Medicine", percentage: 80, attended: 4, total: 5, color: "bg-purple-600" },
  ],
};

export interface DemoAttendanceHistoryItem {
  id: string;
  date: string;
  time: string;
  subject: string;
  code: string;
  topic: string;
  type: string;
  batch: string;
  status: "PRESENT" | "ABSENT";
}

export const demoAttendanceHistory: DemoAttendanceHistoryItem[] = [
  {
    id: "att-1",
    date: "2026-09-07",
    time: "08:00 - 09:00",
    subject: "Pathology",
    code: "PATH",
    topic: "Hypersensitivity Reaction",
    type: "Lecture",
    batch: "ALL",
    status: "PRESENT",
  },
  {
    id: "att-2",
    date: "2026-09-07",
    time: "09:00 - 10:00",
    subject: "Pharmacology",
    code: "PHARMA",
    topic: "Anthelmintic Drugs",
    type: "Lecture",
    batch: "ALL",
    status: "PRESENT",
  },
  {
    id: "att-3",
    date: "2026-09-05",
    time: "08:00 - 09:00",
    subject: "OBG",
    code: "OBG",
    topic: "Antenatal Care Principles",
    type: "Lecture",
    batch: "ALL",
    status: "PRESENT",
  },
  {
    id: "att-4",
    date: "2026-09-03",
    time: "14:00 - 16:00",
    subject: "Pharmacology",
    code: "PHARMA",
    topic: "Pharmacy Dispensing Practical",
    type: "Practical",
    batch: "Batch A",
    status: "ABSENT",
  },
  {
    id: "att-5",
    date: "2026-09-02",
    time: "08:00 - 09:00",
    subject: "Microbiology",
    code: "MICRO",
    topic: "Vibrio cholerae Bacteriology",
    type: "Lecture",
    batch: "ALL",
    status: "PRESENT",
  },
];

export const demoCurriculum = [
  {
    code: "PATH",
    name: "Pathology",
    progress: 72,
    units: [
      {
        unit_number: 1,
        title: "Hematology & Lymphoreticular System",
        topics: [
          { id: "t-1", code: "PA-HEM-01", title: "Anemia: General Classification & Approach", status: "COMPLETED" as const },
          { id: "t-2", code: "PA-HEM-02", title: "Iron Deficiency Anemia (Pathogenesis & Blood Film)", status: "COMPLETED" as const },
          { id: "t-3", code: "PA-HEM-03", title: "Megaloblastic Anemia (B12 & Folate)", status: "LEARNING" as const },
          { id: "t-4", code: "PA-HEM-04", title: "Hemolytic Anemia (Sickle Cell & Thalassemia)", status: "LEARNING" as const },
          { id: "t-5", code: "PA-HEM-05", title: "Acute & Chronic Leukemias (ALL, AML, CML)", status: "NOT_STARTED" as const },
          { id: "t-6", code: "PA-HEM-06", title: "Hodgkin & Non-Hodgkin Lymphomas", status: "NOT_STARTED" as const },
        ],
      },
      {
        unit_number: 2,
        title: "Systemic Pathology: Cardiovascular & Respiratory",
        topics: [
          { id: "t-7", code: "PA-SYS-01", title: "Atherosclerosis & Ischemic Heart Disease", status: "COMPLETED" as const },
          { id: "t-8", code: "PA-SYS-02", title: "Rheumatic Heart Disease & Endocarditis", status: "NOT_STARTED" as const },
          { id: "t-9", code: "PA-SYS-03", title: "Pneumonia & Pulmonary Tuberculosis", status: "NOT_STARTED" as const },
        ],
      },
    ],
  },
  {
    code: "PHARMA",
    name: "Pharmacology",
    progress: 81,
    units: [
      {
        unit_number: 1,
        title: "Antimicrobial & Chemotherapeutic Agents",
        topics: [
          { id: "t-10", code: "PH-ANT-01", title: "Beta-lactam Antibiotics (Penicillins & Cephalosporins)", status: "COMPLETED" as const },
          { id: "t-11", code: "PH-ANT-02", title: "Antitubercular Chemotherapy (DOTS Regimen)", status: "COMPLETED" as const },
          { id: "t-12", code: "PH-ANT-03", title: "Antimalarial Pharmacology (Artemisinin & Quinine)", status: "LEARNING" as const },
        ],
      },
    ],
  },
  {
    code: "MICRO",
    name: "Microbiology",
    progress: 65,
    units: [
      {
        unit_number: 1,
        title: "Systemic Bacteriology & Parasitology",
        topics: [
          { id: "t-13", code: "MI-BAC-01", title: "Enteric Fever (Salmonella typhi diagnosis)", status: "COMPLETED" as const },
          { id: "t-14", code: "MI-PAR-01", title: "Protozoology: Amoebiasis & Giardiasis", status: "LEARNING" as const },
          { id: "t-15", code: "MI-PAR-02", title: "Helminthology: Ascaris & Hookworm life cycles", status: "NOT_STARTED" as const },
        ],
      },
    ],
  },
];

export const demoBatchStats = {
  batch_average_attendance_pct: 82.4,
  active_students_30d: 142,
  subject_averages: [
    { subject_name: "Pharmacology", subject_code: "PHARMA", avg_pct: 85.6 },
    { subject_name: "Pathology", subject_code: "PATH", avg_pct: 83.2 },
    { subject_name: "Medicine", subject_code: "MED", avg_pct: 82.0 },
    { subject_name: "Microbiology", subject_code: "MICRO", avg_pct: 79.5 },
    { subject_name: "Community Medicine", subject_code: "CFM", avg_pct: 81.3 },
  ],
};

export const demoBatches = [
  { id: "b-1", name: "Batch A", roll_min: 1, roll_max: 40, is_default_fallback: false, notes: "Roll No. 01 to 40 (Practicals A, Tutorials)" },
  { id: "b-2", name: "Batch B", roll_min: 41, roll_max: 80, is_default_fallback: false, notes: "Roll No. 41 to 80 (Practicals B, Tutorials)" },
  { id: "b-3", name: "Batch C", roll_min: 81, roll_max: 999, is_default_fallback: true, notes: "Roll No. 81 onwards + Old Students" },
];

export const demoRegisteredStudents = [
  { id: "s-1", roll: "24001", name: "Aarav Sharma", email: "aarav.24001@aiims.edu", batch: "Batch A", status: "Active" },
  { id: "s-2", roll: "24015", name: "Priya Patel", email: "priya.24015@aiims.edu", batch: "Batch A", status: "Active" },
  { id: "s-3", roll: "24042", name: "Rohan Verma", email: "rohan.24042@aiims.edu", batch: "Batch B", status: "Active" },
  { id: "s-4", roll: "24068", name: "Ananya Iyer", email: "ananya.24068@aiims.edu", batch: "Batch B", status: "Active" },
  { id: "s-5", roll: "24095", name: "Vikram Kumar", email: "vikram.24095@aiims.edu", batch: "Batch C", status: "Active" },
];
