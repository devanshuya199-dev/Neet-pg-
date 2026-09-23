"use client";

import { ChanceBadge } from "./ChanceBadge";
import { Probability } from "@/lib/predictor";

type Result = {
  college: string; state: string; collegeType: string; branch: string;
  closingRank: number; openingRank: number; feePerAnnum: number;
  stipendYear1: number | null; bondYears: number | null; bondPenaltyInr: number | null;
  chance: Probability;
};

export function ResultCard({ result }: { result: Result }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{result.collegeType} · {result.state}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{result.college}</h3>
          <p className="mt-1 font-medium text-teal-700">{result.branch}</p>
        </div>
        <ChanceBadge chance={result.chance} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric label="Closing rank" value={result.closingRank.toLocaleString()} />
        <Metric label="Opening rank" value={result.openingRank.toLocaleString()} />
        <Metric label="Tuition / yr" value={`₹${(result.feePerAnnum / 100000).toFixed(1)}L`} />
        <Metric label="Stipend Y1" value={result.stipendYear1 ? `₹${result.stipendYear1.toLocaleString()}` : "—"} />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        Bond: {result.bondYears ?? 0} yr · Penalty: {result.bondPenaltyInr ? `₹${result.bondPenaltyInr.toLocaleString()}` : "None/NA"}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-semibold">{value}</div></div>;
}
