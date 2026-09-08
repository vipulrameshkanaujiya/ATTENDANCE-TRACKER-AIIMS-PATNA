import { PDFParse } from "pdf-parse";
import type { ClassType, BatchScope, TimetableImportRow } from "../../types/database.ts";

export interface ParsedScheduleRow {
  date: string; // YYYY-MM-DD
  day_of_week: string;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  subject_code: string;
  topic: string;
  faculty: string | null;
  venue: string;
  class_type: ClassType;
  batch_scope: BatchScope;
  parse_status: "VALID" | "NEEDS_REVIEW" | "UNKNOWN";
  notes?: string;
}

export interface ParseResult {
  month_year: string;
  total_pages: number;
  rows: ParsedScheduleRow[];
  holidays: { date: string; title: string }[];
  errors: string[];
}

const KNOWN_SUBJECTS = ["PATH", "PHARMA", "MICRO", "FMT", "CFM", "MED", "SURG", "OBG", "AETCOM"];

function extractFaculty(text: string): { cleanedTopic: string; faculty: string | null } {
  // Matches "– Dr. ..." or "- Dr. ..." or "– Prof. (Dr.) ..." or "- All SRs & JRs"
  const facultyRegex = /[–-]\s*(Dr\.|Prof\.\s*\(Dr\.\)|All\s+SRs\s*&?\s*JRs)(.*)$/i;
  const match = text.match(facultyRegex);
  if (match) {
    const faculty = `${match[1]} ${match[2]}`.trim().replace(/\s+/g, " ");
    const cleanedTopic = text.replace(facultyRegex, "").trim();
    return { cleanedTopic, faculty };
  }
  return { cleanedTopic: text.trim(), faculty: null };
}

function detectSubjectAndType(rawText: string): {
  subjectCode: string;
  classType: ClassType;
  cleanedText: string;
  status: "VALID" | "NEEDS_REVIEW" | "UNKNOWN";
} {
  const trimmed = rawText.trim();
  let subjectCode = "UNKNOWN";
  let classType: ClassType = "Lecture";
  let status: "VALID" | "NEEDS_REVIEW" | "UNKNOWN" = "VALID";

  // Check known subjects
  for (const s of KNOWN_SUBJECTS) {
    if (new RegExp(`\\b${s}\\b`, "i").test(trimmed)) {
      subjectCode = s;
      break;
    }
  }

  // Detect class type
  if (/practical/i.test(trimmed)) {
    classType = "Practical";
  } else if (/tutorial/i.test(trimmed)) {
    classType = "Tutorial";
  } else if (/integration/i.test(trimmed)) {
    classType = "Integration";
  } else if (/sdl/i.test(trimmed)) {
    classType = "SDL";
  } else if (/clinical\s+posting/i.test(trimmed)) {
    classType = "Clinical Posting";
    subjectCode = "CLINICAL";
  } else if (/seminar/i.test(trimmed)) {
    classType = "Seminar";
  } else if (/exam/i.test(trimmed)) {
    classType = "Exam";
  } else {
    classType = "Lecture";
  }

  // Clean prefix like "PHARMA:", "PATH (Practical):", "MICRO:"
  let cleaned = trimmed
    .replace(/^(PATH|PHARMA|MICRO|CFM|FMT|MED|SURG|OBG|AETCOM)\s*(\([^)]+\))?\s*:\s*/i, "")
    .trim();

  if (subjectCode === "UNKNOWN") {
    status = "NEEDS_REVIEW";
  }

  return { subjectCode, classType, cleanedText: cleaned, status };
}

export async function parseTimetablePDF(uint8Array: Uint8Array): Promise<ParseResult> {
  const parser = new PDFParse(uint8Array);
  // load handled automatically by getText()
  const textResult = await parser.getText();

  const rows: ParsedScheduleRow[] = [];
  const holidays: { date: string; title: string }[] = [];
  const errors: string[] = [];

  let combinedText = "";
  if (textResult.pages && textResult.pages.length > 0) {
    combinedText = textResult.pages.map((p: any) => p.text).join("\n");
  } else {
    combinedText = textResult.text || "";
  }

  // Detect month from header
  const monthMatch = combinedText.match(/Month\s+of\s+([A-Za-z]+\s+\d{4})/i);
  const month_year = monthMatch ? monthMatch[1] : "September 2026";

  // Split into lines
  const lines = combinedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Group lines by date
  // Date pattern: "01-09-26" or "01-09-2026"
  const dateRegex = /^(\d{2})-(\d{2})-(\d{2,4})\s*([A-Za-z]+)?/i;

  let currentDate: string | null = null;
  let currentDayOfWeek: string = "";
  let currentDayLines: string[] = [];

  const processDayBlock = (dateStr: string, dayOfWeek: string, dayLines: string[]) => {
    // Format date to YYYY-MM-DD
    const parts = dateStr.split("-");
    const day = parts[0];
    const month = parts[1];
    let year = parts[2];
    if (year.length === 2) year = `20${year}`;
    const isoDate = `${year}-${month}-${day}`;

    const joinedText = dayLines.join(" ");

    // 1. Holiday or Weekly Off check
    if (/holiday/i.test(joinedText) || /weekly\s+off/i.test(joinedText) || /sunday/i.test(joinedText)) {
      holidays.push({
        date: isoDate,
        title: /holiday/i.test(joinedText) ? "Holiday" : "Weekly Off",
      });
      return;
    }

    // 2. Clinical Posting: Weekdays usually have Clinical Posting 10 AM - 1 PM
    if (/clinical\s+posting/i.test(joinedText)) {
      rows.push({
        date: isoDate,
        day_of_week: dayOfWeek,
        start_time: "10:00:00",
        end_time: "13:00:00",
        subject_code: "CLINICAL",
        topic: "Clinical Postings / Hospital Duty",
        faculty: null,
        venue: "Hospital Wards",
        class_type: "Clinical Posting",
        batch_scope: "ALL",
        parse_status: "VALID",
      });
    }

    // 3. Extract items by subject matches
    // Match each subject mention like "PATH:", "PHARMA:", "MICRO:", "AETCOM:", "CFM:", "FMT:"
    const subjectMatches = Array.from(
      joinedText.matchAll(/(PATH|PHARMA|MICRO|CFM|FMT|OBG|MED|SURG|AETCOM)(\s*\([^)]+\))?\s*:\s*([^;]+?)(?=(PATH|PHARMA|MICRO|CFM|FMT|OBG|MED|SURG|AETCOM|\bSPORTS\b|Clinical\s+Posting|$))/gi)
    );

    let lectureCount = 0;
    subjectMatches.forEach((m) => {
      const fullSnippet = m[0].trim();
      const { subjectCode, classType, cleanedText, status } = detectSubjectAndType(fullSnippet);
      const { cleanedTopic, faculty } = extractFaculty(cleanedText);

      // Distinguish time slot
      let startTime = "08:00:00";
      let endTime = "09:00:00";
      let batchScope: BatchScope = "ALL";

      if (classType === "Practical" || classType === "Tutorial") {
        startTime = "14:00:00";
        endTime = "16:00:00";
        // Check if explicit batch mention
        if (/batch\s*a/i.test(fullSnippet)) batchScope = "Batch A";
        else if (/batch\s*b/i.test(fullSnippet)) batchScope = "Batch B";
        else if (/batch\s*c/i.test(fullSnippet)) batchScope = "Batch C";
        else batchScope = "ALL";
      } else if (classType === "Integration") {
        startTime = "10:00:00";
        endTime = "12:00:00";
      } else if (classType === "SDL") {
        startTime = "12:00:00";
        endTime = "13:00:00";
      } else {
        // Lecture
        lectureCount++;
        if (lectureCount === 1) {
          startTime = "08:00:00";
          endTime = "09:00:00";
        } else {
          startTime = "09:00:00";
          endTime = "10:00:00";
        }
      }

      rows.push({
        date: isoDate,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        subject_code: subjectCode,
        topic: cleanedTopic || "Lecture Session",
        faculty: faculty,
        venue: classType === "Practical" ? "Department Lab" : "Lecture Hall 2",
        class_type: classType,
        batch_scope: batchScope,
        parse_status: status,
      });
    });
  };

  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      if (currentDate) {
        processDayBlock(currentDate, currentDayOfWeek, currentDayLines);
      }
      currentDate = `${match[1]}-${match[2]}-${match[3]}`;
      currentDayOfWeek = match[4] || "";
      currentDayLines = [line.replace(match[0], "").trim()];
    } else if (currentDate) {
      currentDayLines.push(line);
    }
  }

  if (currentDate) {
    processDayBlock(currentDate, currentDayOfWeek, currentDayLines);
  }

  return {
    month_year,
    total_pages: textResult.pages?.length || 1,
    rows,
    holidays,
    errors,
  };
}
