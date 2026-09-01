# eProfile System — Version

## Current Version

**v1.1.0**

- Release channel: `stable`
- Release date: 2026-09-01
- Baseline: `v1.0.0`
- Purpose: Security Hardening & Production Readiness

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
6. บันทึก Git commit และ tag เช่น `v1.1.0`
7. อัปเดต Release Record ใน `DEV_CHECKLIST.md`

## Current Release Gate Status

- TypeScript: 🟢 PASS
- ESLint: 🟢 PASS
- Production Build: 🟢 PASS
- Authorization Hardening: 🟢 PASS (Full Role Matrix Verified)
- Full Automated Security Tests: 🟢 PASS (5/5 Test Suites)
- Production Release Status: 🟢 **FROZEN & RELEASED (v1.1.0)**
