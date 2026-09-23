# MedAdmit PG

Production-oriented Next.js 14 + TypeScript + Prisma/PostgreSQL starter for a NEET PG counselling and seat-prediction portal.

## Features

- Marks -> AIR range using multi-year weighted interpolation.
- AIR -> historical college/branch chance classification.
- Quota/category/state/college-type/fee filtering.
- PostgreSQL/Prisma relational model.
- Round-wise cutoff storage.
- Recharts-ready trend visualization.
- Responsive medical-themed dashboard.
- API endpoints for prediction and cutoff search.
- Mock dataset clearly marked as unverified.

## Run locally

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Production data policy

Do not present the mock ranks, fees, stipends, bonds or marks curves as official. Before launch, create an ingestion/verification pipeline from authoritative counselling sources and store `source_url`, `verified_at`, and provenance metadata for every cutoff row.

## Recommended production additions

1. Authentication + saved preference profiles.
2. Materialized views for latest cutoff per college/branch/quota/category.
3. PostgreSQL full-text/trigram indexes for college and branch search.
4. Redis/Upstash caching for high-volume predictor queries.
5. Rate limiting and request validation.
6. Admin data-review console with source/provenance workflow.
7. Automated data-quality checks for impossible rank ranges and fee anomalies.
8. Audit log for every cutoff update.
9. Separate current-year provisional data from verified historical data.
10. Monitoring with Sentry/OpenTelemetry.

## Predictor caveat

Marks-to-rank is inherently uncertain because score distributions and candidate counts vary by examination year. The included curve is a demonstration model, not an official rank-conversion table.
