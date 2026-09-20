import { getAllStudentsAttendanceAction } from "@/app/actions/admin";
import { AttendanceOverviewTable } from "@/components/admin/AttendanceOverviewTable";

export const metadata = { title: "Attendance Overview | Admin" };

export default async function AttendanceOverviewPage() {
  const result = await getAllStudentsAttendanceAction();
  if (!result.success) {
    return <p className="text-red-600">Error: {result.error}</p>;
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Attendance Overview</h1>
        <p className="text-sm text-text-muted mt-1">
          Track any student's cumulative attendance and how many classes they need to reach 76%.
        </p>
      </div>
      <AttendanceOverviewTable students={result.students || []} />
    </div>
  );
}
