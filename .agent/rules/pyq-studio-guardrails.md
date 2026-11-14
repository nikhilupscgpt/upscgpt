# PYQ Studio & Cleanup Guardrails

1. **One phase at a time:** Implement only the active phase, verify with tests/parse/build checks, report files changed + verification results + anything left undone, and wait for user approval before starting the next phase.
2. **Database safety:** Never run `prisma migrate reset`, `prisma db push --force-reset`, `DROP TABLE`, or delete/overwrite existing `Question` rows. Cleanup scripts MUST default to dry-run (`reports/pyq-cleanup/*.csv`) and require explicit `--apply` + user approval.
3. **Use real codebase models:** Extend existing `Question`, `Subject`, `Topic`, `MicroTheme`, `QuestionSource`, `QuestionRevision` in `prisma/schema.prisma` — never create duplicate `PyqQuestion` or `Difficulty` enums.
4. **Reuse Analytics & Security helpers:** Reuse `QuestionReport`, `SecurityEvent`, `AuditLog`, `writeAuditLog`, `writeSecurityEvent`, and `checkScrapeGuard` from `src/lib/security/guards.ts` and `src/lib/rateLimit.js`.
5. **No Tailwind CSS:** This repository uses custom CSS variables in `src/app/globals.css` (Midnight Library dark/light theme), CSS modules, `styled-jsx`, and `lucide-react`. Never rely on Tailwind utility classes for UI components.
6. **Preserve recording capture:** Wrap/extend `/admin/recording-studio` media capture and download/storage behaviour into `RecordingSession` without rewriting or deleting existing recording files.
