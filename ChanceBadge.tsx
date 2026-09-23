import { Probability } from "@/lib/predictor";

export function ChanceBadge({ chance }: { chance: Probability }) {
  const styles = {
    SAFE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    MODERATE: "bg-amber-50 text-amber-700 ring-amber-200",
    DREAM: "bg-rose-50 text-rose-700 ring-rose-200"
  };
  const labels = { SAFE: "High Chance", MODERATE: "Moderate", DREAM: "Dream" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[chance]}`}>{labels[chance]}</span>;
}
