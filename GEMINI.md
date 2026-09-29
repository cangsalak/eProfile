# 🛡️ Gemini Assistant Guide (eProfile System)

> **MANDATORY INSTRUCTION:**
> You must strictly follow all engineering, security, UI, database, and quality rules documented in [AGENTS.md](file:///Users/cangsalak/project/eprofile/AGENTS.md).

## Quick Summary of Inviolable Rules:
1. **Never leak secrets** (JWT secrets, S3 keys, DB passwords) in API outputs or responses.
2. **Never reset or drop databases** (`--accept-data-loss` and destructive migrations are prohibited).
3. **Anti-Self Approval:** No user (including SUPER_ADMIN) may approve their own leave request.
4. **UI Design System:** Use shared primitives from `@/components/ui` (`StatCard`, `Card`, `Button`, `Input`, `Select`, `Badge`) and never hand-craft raw divs.
5. **Page Headers & Breadcrumbs:** `DashboardShell` already renders `<PageBreadcrumb />`. Do NOT create redundant `<h1>` or `<h2>` page headers. Use `<PageHeaderExtra>` from `@/modules/core/components/layout/PageHeaderContext` to inject buttons/actions into the top right header slot.
6. **Module Settings / Menus:** If a menu represents a module's settings page (e.g. "จัดการแม่แบบเอกสาร"), it must have `isSetting: true` in its `manifest.ts` so it is hidden from the Sidebar and managed centrally via Module Manager instead.
7. **Quality Gate:** Always run `npx tsc --noEmit` and `npm run lint` before reporting work as complete.
8. **Upload & Storage Isolation:** Always isolate uploaded files by specifying `module` (e.g. `users`, `news`, `badges`, `e-form`) and `folder` (e.g. `avatars`, `posts`, `templates`). Default file sorting must always be `createdAt: 'desc'`.

Refer to [AGENTS.md](file:///Users/cangsalak/project/eprofile/AGENTS.md) for the complete architecture and engineering manual.
