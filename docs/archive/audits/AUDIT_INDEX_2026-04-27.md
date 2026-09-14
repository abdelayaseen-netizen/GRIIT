# Audit deliverables index (2026-04-27)

Read these in order:

1. [`AUDIT_00_RUBRIC_WAVE1_WAVE2_2026-04-27.md`](./AUDIT_00_RUBRIC_WAVE1_WAVE2_2026-04-27.md) — Phase 0 rubric, Wave 1 raw inventory, Wave 2 scans, gates, and the **`store\` path miss** (adds 5 files not in original Wave 1.1 list).

2. **Wave 3 frontend (277 files, one entry each)**  
   - Full single file: [`AUDIT_FRONTEND_GENERATED_2026-04-27.md`](./AUDIT_FRONTEND_GENERATED_2026-04-27.md) (~1.0 MB).  
   - Thirds (same content split):  
     - [`AUDIT_FRONTEND_A_2026-04-27.md`](./AUDIT_FRONTEND_A_2026-04-27.md)  
     - [`AUDIT_FRONTEND_B_2026-04-27.md`](./AUDIT_FRONTEND_B_2026-04-27.md)  
     - [`AUDIT_FRONTEND_C_2026-04-27.md`](./AUDIT_FRONTEND_C_2026-04-27.md)  

3. **Supporting data (regenerable)**  
   - [`_audit-fe-lines.csv`](./_audit-fe-lines.csv) — path + line count.  
   - [`_audit-fe-heuristics.csv`](./_audit-fe-heuristics.csv) — per-file flags used for scoring (catch count, Sentry/PostHog string matches, etc.).  
   - [`_audit-fe-exports.txt`](./_audit-fe-exports.txt) — first-pass `export` line per file.  
   - [`Generate-AuditFrontend.ps1`](./Generate-AuditFrontend.ps1) — rebuilds the Wave 3 markdown from CSVs.

4. **Zustand `store\` (not in original Wave 1.1 scope)**  
   - [`AUDIT_STORE_2026-04-27.md`](./AUDIT_STORE_2026-04-27.md) — list of 5 files and import sites.

5. **Backend (78 files)**  
   - Not generated in this run. Contract: `Get-ChildItem -Recurse -File -Include *.ts -Path .\backend` (excluding `node_modules`, `dist`, `build`). Reuse the same rubric; procedure inventory is in `AUDIT_00` (107 `.query|.mutation|.subscription` parenthesis opens in `backend\`).

**Honest limits of the auto-generated Wave 3:** rows use static heuristics and file text; they are not a substitute for line-by-line human proof on every `catch` block, every navigation call, and every `lib/analytics` indirection. Re-score any file after reading it fully.
