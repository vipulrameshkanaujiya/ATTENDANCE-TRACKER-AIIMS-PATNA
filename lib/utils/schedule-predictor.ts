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
  units: number;
}> {
  const classes: Array<{
    date: string;
    start_time: string;
    end_time: string;
    subject_code: string;
    class_type: "Lecture" | "Practical" | "Tutorial" | "Integration" | "SDL";
    batch_scope: string;
    units: number;
  }> = [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const holidays = ["2026-09-04", "2026-10-02", "2026-10-20", "2026-11-08"];

  // Normalize batch string to standard
  const batchStr = batch.startsWith("Batch A") ? "Batch A" : batch.startsWith("Batch B") ? "Batch B" : batch.startsWith("Batch C") ? "Batch C" : "Batch A";

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to check if a date is a holiday
  const isHoliday = (d: Date) => {
    return holidays.includes(getLocalDateString(d));
  };

  // Helper to get occurrence of weekday in month (1st, 2nd, etc)
  const getOccurrenceOfWeekday = (d: Date) => {
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const firstDayOfWeek = firstOfMonth.getDay();
    const offset = (dayOfWeek - firstDayOfWeek + 7) % 7;
    const firstDateWithThisWeekday = 1 + offset;
    return Math.floor((d.getDate() - firstDateWithThisWeekday) / 7) + 1;
  };

  const addClass = (
    dateStr: string,
    start_time: string,
    end_time: string,
    subject_code: string,
    class_type: "Lecture" | "Practical" | "Tutorial" | "Integration" | "SDL",
    batch_scope: string
  ) => {
    let units = 1;
    if (subject_code === "PHARMA" && class_type === "Integration") {
      units = 2;
    }
    classes.push({
      date: dateStr,
      start_time,
      end_time,
      subject_code,
      class_type,
      batch_scope,
      units,
    });
  };

  let currentDate = new Date(start);
  while (currentDate <= end) {
    if (isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dateStr = getLocalDateString(currentDate);
    const occurrence = getOccurrenceOfWeekday(currentDate);

    if (dayOfWeek === 1) { // Monday
      addClass(dateStr, "08:00:00", "09:00:00", "PATH", "Lecture", "ALL");
      addClass(dateStr, "09:00:00", "10:00:00", "PHARMA", "Lecture", "ALL");
      
      const tutSubject = (occurrence === 1 || occurrence === 4) ? "PATH" : (occurrence === 2 || occurrence === 5) ? "PHARMA" : "MICRO";
      addClass(dateStr, "14:00:00", "16:00:00", tutSubject, "Tutorial", "ALL");
    }
    else if (dayOfWeek === 2) { // Tuesday
      addClass(dateStr, "08:00:00", "09:00:00", "PHARMA", "Lecture", "ALL");
      addClass(dateStr, "09:00:00", "10:00:00", "MICRO", "Lecture", "ALL");
      
      const pracSubject = batchStr === "Batch A" ? "PATH" : batchStr === "Batch B" ? "PHARMA" : "MICRO";
      addClass(dateStr, "14:00:00", "16:00:00", pracSubject, "Practical", batchStr);
    }
    else if (dayOfWeek === 3) { // Wednesday
      addClass(dateStr, "08:00:00", "09:00:00", "MICRO", "Lecture", "ALL");
      addClass(dateStr, "09:00:00", "10:00:00", "PATH", "Lecture", "ALL");
      
      const pracSubject = batchStr === "Batch A" ? "MICRO" : batchStr === "Batch B" ? "PATH" : "PHARMA";
      addClass(dateStr, "14:00:00", "16:00:00", pracSubject, "Practical", batchStr);
    }
    else if (dayOfWeek === 4) { // Thursday
      addClass(dateStr, "08:00:00", "09:00:00", "PATH", "Lecture", "ALL");
      addClass(dateStr, "09:00:00", "10:00:00", "PHARMA", "Lecture", "ALL");
      
      const pracSubject = batchStr === "Batch A" ? "PHARMA" : batchStr === "Batch B" ? "MICRO" : "PATH";
      addClass(dateStr, "14:00:00", "16:00:00", pracSubject, "Practical", batchStr);
    }
    else if (dayOfWeek === 6) { // Saturday
      if (occurrence >= 1 && occurrence <= 3) {
        const satSubject = occurrence === 1 ? "PATH" : occurrence === 2 ? "PHARMA" : "MICRO";
        addClass(dateStr, "10:00:00", "12:00:00", satSubject, "Integration", "ALL");
        addClass(dateStr, "12:00:00", "13:00:00", satSubject, "SDL", "ALL");
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return classes;
}
