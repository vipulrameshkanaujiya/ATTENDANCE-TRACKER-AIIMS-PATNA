import { requireOnboarded } from "@/lib/auth/session";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireOnboarded();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <BottomNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader profile={profile} />
        <main className="flex-1 w-full max-w-5xl p-4 sm:p-6 pb-24 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
