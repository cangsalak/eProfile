# 🛡️ Claude Assistant Guide (eProfile System)

> **MANDATORY INSTRUCTION:**
> You must strictly follow all engineering, security, UI, database, and quality rules documented in [AGENTS.md](file:///Users/cangsalak/project/eprofile/AGENTS.md).

## Quick Summary of Inviolable Rules:
1. **Never leak secrets** (JWT secrets, S3 keys, DB passwords) in API outputs or responses.
2. **Never reset or drop databases** (`--accept-data-loss` and destructive migrations are prohibited).
3. **Anti-Self Approval:** No user (including SUPER_ADMIN) may approve their own leave request.
4. **UI Design System:** Use shared primitives from `@/components/ui` (`StatCard`, `Card`, `Button`, `Input`, `Select`, `Badge`) and never hand-craft raw divs.
5. **Quality Gate:** Always run `npx tsc --noEmit` and `npm run lint` before reporting work as complete.

Refer to [AGENTS.md](file:///Users/cangsalak/project/eprofile/AGENTS.md) for the complete architecture and engineering manual.
