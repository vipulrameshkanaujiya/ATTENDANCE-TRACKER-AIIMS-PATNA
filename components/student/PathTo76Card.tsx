
import clsx from "clsx";

interface PathTo76Stats {
  theory: { predicted_future: number; need: number; can_skip: number };
  practical: { predicted_future: number; need: number; can_skip: number };
}

export function PathTo76Card({ subjectName, stat }: { subjectName: string; stat: PathTo76Stats }) {
  const getStatusDisplay = (typeLabel: string, typeStat: { predicted_future: number; need: number; can_skip: number }) => {
    if (typeStat.need > typeStat.predicted_future) {
      return (
        <span className="text-red-700 font-medium text-xs">
          ⚠️ Cannot reach 76% (Need {typeStat.need} of {typeStat.predicted_future})
        </span>
      );
    }
    
    if (typeStat.need === 0) {
      return (
        <span className="text-emerald-700 font-medium text-xs">
          ✅ Safe — Can skip {typeStat.can_skip}
        </span>
      );
    }

    const colorClass = 
      typeStat.need <= 5 ? "text-amber-700" : "text-red-700";

    return (
      <span className={clsx("font-medium text-xs", colorClass)}>
        Need {typeStat.need} of {typeStat.predicted_future} predicted (Skip {typeStat.can_skip})
      </span>
    );
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{subjectName}</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16">Theory:</span>
          {getStatusDisplay("Theory", stat.theory)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16">Practical:</span>
          {getStatusDisplay("Practical", stat.practical)}
        </div>
      </div>
      {subjectName.toUpperCase().includes("PHARMA") && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
            ℹ️ PHARMA Integration counts as 2 units + SDL as 1 unit (total 3 per Saturday)
          </p>
        </div>
      )}
    </div>
  );
}
