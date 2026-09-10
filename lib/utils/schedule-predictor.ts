
export function generateFutureClasses(
  startDate: string,
  endDate: string,
  batch: "Batch A" | "Batch B" | "Batch C" | string
): Array<{
  date: string;
  start_time: string;
  end_time: string;
  subject_code: string;
  class_type: "Lecture" | "Practical" | "Tutorial" | "Integration" | "SDL";
  batch_scope: string;
}> {
  const classes: Array<{
    date: string;
    start_time: string;
    end_time: string;
    subject_code: string;
    class_type: "Lecture" | "Practical" | "Tutorial" | "Integration" | "SDL";
    batch_scope: string;
  }> = [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const holidays = ["2026-09-04", "2026-10-02", "2026-10-20", "2026-11-08"];

  // Normalize batch string to standard
  const batchStr = batch.startsWith("Batch A") ? "Batch A" : batch.startsWith("Batch B") ? "Batch B" : batch.startsWith("Batch C") ? "Batch C" : "Batch A";

  // Helper to check if a date is a holiday
  const isHoliday = (d: Date) => {
    const dStr = d.toISOString().split("T")[0];
    return holidays.includes(dStr);
  };

  // Helper to get week of month (1-5)
  const getWeekOfMonth = (d: Date) => {
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return Math.ceil((d.getDate() + firstDay) / 7);
  };

  let currentDate = new Date(start);
  while (currentDate <= end) {
    if (isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dateStr = currentDate.toISOString().split("T")[0];
    const weekOfMonth = getWeekOfMonth(currentDate);

    if (dayOfWeek === 1) { // Monday
      // Lectures (Mon-Thu, 8-10 AM)
      classes.push({ date: dateStr, start_time: "08:00:00", end_time: "09:00:00", subject_code: "PATH", class_type: "Lecture", batch_scope: "ALL" });
      classes.push({ date: dateStr, start_time: "09:00:00", end_time: "10:00:00", subject_code: "PHARMA", class_type: "Lecture", batch_scope: "ALL" });
      
      // Tutorials (Mondays, 2-4 PM)
      const tutSubject = (weekOfMonth === 1 || weekOfMonth === 4) ? "PATH" : (weekOfMonth === 2 || weekOfMonth === 5) ? "PHARMA" : "MICRO";
      classes.push({ date: dateStr, start_time: "14:00:00", end_time: "16:00:00", subject_code: tutSubject, class_type: "Tutorial", batch_scope: "ALL" });
    }
    else if (dayOfWeek === 2) { // Tuesday
      classes.push({ date: dateStr, start_time: "08:00:00", end_time: "09:00:00", subject_code: "PHARMA", class_type: "Lecture", batch_scope: "ALL" });
      classes.push({ date: dateStr, start_time: "09:00:00", end_time: "10:00:00", subject_code: "MICRO", class_type: "Lecture", batch_scope: "ALL" });
      
      // Practicals
      const pracSubject = batchStr === "Batch A" ? "PATH" : batchStr === "Batch B" ? "PHARMA" : "MICRO";
      classes.push({ date: dateStr, start_time: "14:00:00", end_time: "16:00:00", subject_code: pracSubject, class_type: "Practical", batch_scope: batchStr });
    }
    else if (dayOfWeek === 3) { // Wednesday
      classes.push({ date: dateStr, start_time: "08:00:00", end_time: "09:00:00", subject_code: "MICRO", class_type: "Lecture", batch_scope: "ALL" });
      classes.push({ date: dateStr, start_time: "09:00:00", end_time: "10:00:00", subject_code: "PATH", class_type: "Lecture", batch_scope: "ALL" });
      
      // Practicals
      const pracSubject = batchStr === "Batch A" ? "PHARMA" : batchStr === "Batch B" ? "MICRO" : "PATH";
      classes.push({ date: dateStr, start_time: "14:00:00", end_time: "16:00:00", subject_code: pracSubject, class_type: "Practical", batch_scope: batchStr });
    }
    else if (dayOfWeek === 4) { // Thursday
      classes.push({ date: dateStr, start_time: "08:00:00", end_time: "09:00:00", subject_code: "PATH", class_type: "Lecture", batch_scope: "ALL" });
      classes.push({ date: dateStr, start_time: "09:00:00", end_time: "10:00:00", subject_code: "PHARMA", class_type: "Lecture", batch_scope: "ALL" });
      
      // Practicals
      const pracSubject = batchStr === "Batch A" ? "MICRO" : batchStr === "Batch B" ? "PATH" : "PHARMA";
      classes.push({ date: dateStr, start_time: "14:00:00", end_time: "16:00:00", subject_code: pracSubject, class_type: "Practical", batch_scope: batchStr });
    }
    else if (dayOfWeek === 6) { // Saturday
      if (weekOfMonth >= 1 && weekOfMonth <= 3) {
        const satSubject = weekOfMonth === 1 ? "PATH" : weekOfMonth === 2 ? "PHARMA" : "MICRO";
        classes.push({ date: dateStr, start_time: "10:00:00", end_time: "12:00:00", subject_code: satSubject, class_type: "Integration", batch_scope: "ALL" });
        classes.push({ date: dateStr, start_time: "12:00:00", end_time: "13:00:00", subject_code: satSubject, class_type: "SDL", batch_scope: "ALL" });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return classes;
}
