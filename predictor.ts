export type Probability = "SAFE" | "MODERATE" | "DREAM";

export type MarksBand = {
  year: number;
  score: number;
  airMin: number;
  airMax: number;
};

export type RankPrediction = {
  airMin: number;
  airMax: number;
  midpoint: number;
  confidence: number;
  percentileMin: number;
  percentileMax: number;
};

const TOTAL_CANDIDATES_BY_YEAR: Record<number, number> = {
  2023: 208000,
  2024: 216000,
  2025: 242000,
  2026: 280000
};

function interpolate(a: MarksBand, b: MarksBand, score: number) {
  const t = (score - a.score) / (b.score - a.score);
  return {
    airMin: Math.round(a.airMin + t * (b.airMin - a.airMin)),
    airMax: Math.round(a.airMax + t * (b.airMax - a.airMax))
  };
}

/**
 * Client-side marks -> AIR algorithm.
 *
 * 1. Clamp the score.
 * 2. Interpolate within each year's empirical marks/AIR curve.
 * 3. Weight recent years more heavily: 2026=40%, 2025=30%, 2024=20%, 2023=10%.
 * 4. Inflate the interval by a difficulty/uncertainty factor.
 *
 * IMPORTANT: The curves are illustrative until populated with verified official/exam-derived data.
 */
export function predictAirFromMarks(score: number, curves: MarksBand[], years = [2026, 2025, 2024, 2023]): RankPrediction {
  const validScore = Math.max(0, Math.min(800, score));
  const weights = [0.4, 0.3, 0.2, 0.1];

  const predictions = years.map((year, index) => {
    const rows = curves.filter(r => r.year === year).sort((a, b) => a.score - b.score);
    if (!rows.length) return null;

    if (validScore <= rows[0].score) return { year, ...rows[0], weight: weights[index] ?? 0 };
    if (validScore >= rows.at(-1)!.score) return { year, ...rows.at(-1)!, weight: weights[index] ?? 0 };

    for (let i = 0; i < rows.length - 1; i++) {
      if (validScore >= rows[i].score && validScore <= rows[i + 1].score) {
        const p = interpolate(rows[i], rows[i + 1], validScore);
        return { year, score: validScore, ...p, weight: weights[index] ?? 0 };
      }
    }
    return null;
  }).filter(Boolean) as Array<MarksBand & { weight: number }>;

  const weightSum = predictions.reduce((s, p) => s + p.weight, 0) || 1;
  const min = predictions.reduce((s, p) => s + p.airMin * p.weight, 0) / weightSum;
  const max = predictions.reduce((s, p) => s + p.airMax * p.weight, 0) / weightSum;

  const spread = Math.max(100, Math.round((max - min) * 0.12));
  const airMin = Math.max(1, Math.round(min - spread));
  const airMax = Math.max(airMin, Math.round(max + spread));

  const total = TOTAL_CANDIDATES_BY_YEAR[2026];
  return {
    airMin, airMax,
    midpoint: Math.round((airMin + airMax) / 2),
    confidence: Math.max(55, Math.min(92, 90 - (airMax - airMin) / 2500)),
    percentileMin: 100 - ((airMax / total) * 100),
    percentileMax: 100 - ((airMin / total) * 100)
  };
}

export function percentileFromAir(air: number, totalCandidates = TOTAL_CANDIDATES_BY_YEAR[2026]) {
  return Math.max(0, Math.min(100, ((totalCandidates - air) / totalCandidates) * 100));
}

/**
 * Closing-rank classification:
 * Safe if historical closing rank is >15% beyond user's rank.
 * Moderate if within +/-15%.
 * Dream if materially tighter than user's rank.
 */
export function classifyChance(userRank: number, closingRank: number): Probability {
  const threshold = userRank * 1.15;
  if (closingRank > threshold) return "SAFE";
  if (closingRank >= userRank * 0.85 && closingRank <= threshold) return "MODERATE";
  return "DREAM";
}
