# MedAdmit PG — Architecture

## Request flow

Browser
  -> Next.js App Router
  -> React predictor UI
  -> POST /api/predict
  -> Zod validation
  -> Prisma
  -> PostgreSQL
  -> marks_vs_rank_history + cutoffs
  -> prediction engine
  -> ranked response
  -> ResultCard / TrendChart

## Data model

College 1---N Cutoff N---1 Branch

Cutoff dimensions:
year × counseling_round × quota × category × college × branch

Marks history:
year × score -> AIR interval

## Probability engine

For user AIR `R` and historical closing rank `C`:

SAFE:
C > R × 1.15

MODERATE:
R × 0.85 <= C <= R × 1.15

DREAM:
C < R × 0.85

This is a deterministic heuristic and should be exposed as a configurable product rule rather than treated as a statistical probability.

## Production recommendation

Use the deterministic label as "historical fit" rather than literal admission probability unless you have a validated statistical model. A future version can calculate an empirical probability from multiple years, category/quota-specific observations, seat matrix changes, and round progression.
