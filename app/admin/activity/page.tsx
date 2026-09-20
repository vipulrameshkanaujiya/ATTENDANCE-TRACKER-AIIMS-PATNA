import { getUserActivityOverviewAction } from "@/app/actions/admin";
import { ActivityTable } from "@/components/admin/ActivityTable";

export const metadata = { title: "User Activity | Admin" };

export default async function ActivityOverviewPage() {
  const result = await getUserActivityOverviewAction();
  if (!result.success) {
    return <p className="text-red-600">Error: {result.error}</p>;
  }

  return <ActivityTable students={result.students || []} />;
}
