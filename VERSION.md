# eProfile System — Version

## Current Version

**v1.3.0**

- Release channel: `stable`
- Release date: 2026-09-08
- Baseline: `v1.2.0`
- Purpose: Complete Google Calendar Duty Roster with Live 24h Timeline, Notification Event Triggers, Multi-Database Universal Engine & Hardened Security Matrix

## Versioning Policy

ใช้ Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — มีการเปลี่ยนแปลงใหญ่ที่อาจไม่เข้ากันกับระบบเดิม
- **MINOR** — เพิ่ม Feature ใหม่โดยยังรักษาความเข้ากันได้
- **PATCH** — แก้ Bug, Security Fix หรือปรับปรุงเล็กน้อย

## Release Rules

1. แก้ไข `package.json` version เป็นแหล่งอ้างอิงหลัก
2. อัปเดต `src/lib/version.ts` ให้ตรงกับ package version
3. เพิ่มรายการใน `CHANGELOG.md`
4. รัน TypeScript และ Production Build
5. ทดสอบ Security/Authorization ที่เกี่ยวข้อง
6. บันทึก Git commit และ tag เช่น `v1.3.0`
7. อัปเดต Release Record ใน `DEV.md`

## Current Release Gate Status (v1.3.0)

- TypeScript: 🟢 PASS (`npx tsc --noEmit` 0 errors)
- ESLint: 🟢 PASS (`npm run lint` 0 errors)
- Automated Test Suite: 🟢 PASS (21/21 Test Suites 100% Passed)
- Google Calendar 4-View Engine: 🟢 PASS
- Military Duty Personnel Tagging & Print Roster: 🟢 PASS
- Notification Triggers & Line/Email Test API: 🟢 PASS
- Universal Multi-Database Backup & Restore: 🟢 PASS
- Official RPB-1 Security Profile (รปภ. ๑ ๑๐ หน้า ๓๐ หมวดหมู่): 🟢 PASS
- Production Release Status: 🟢 **VERIFIED (v1.3.0)**

