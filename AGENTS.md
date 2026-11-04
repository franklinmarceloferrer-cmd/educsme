# Architecture rules

- Aggregate saved tutor progress in `src/lib/tutorProgress.ts`, counting only existing question indices; keep dashboard rendering separate so malformed or stale progress cannot inflate totals.
- Load tutor dashboard summaries with authenticated, user-scoped queries and pagination so every saved lesson contributes without changing access policies.
- Derive subject breakdowns from validated lesson summaries in `src/lib/tutorProgress.ts`, grouping unspecified subjects together and sorting by missed count so review priorities stay consistent.