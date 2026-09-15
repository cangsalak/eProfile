import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { z } from 'zod';

export const ModuleScriptsSchema = z.object({
  install: z.string().optional(),
  uninstall: z.string().optional(),
  update: z.string().optional(),
}).optional();

export function compareVersions(v1: string, v2: string): number {
  const clean = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map((part) => {
        const num = parseInt(part, 10);
        return isNaN(num) ? 0 : num;
      });

  const p1 = clean(v1);
  const p2 = clean(v2);
  const length = Math.max(p1.length, p2.length);

  for (let i = 0; i < length; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function executeLifecycleScript(
  scriptRelativePath: string,
  moduleDir: string
): { success: boolean; error?: string } {
  try {
    const normalized = path.normalize(scriptRelativePath);
    const fullPath = path.resolve(moduleDir, normalized);

    // Security check: verify path is strictly inside the module folder
    if (!fullPath.startsWith(moduleDir + path.sep) && fullPath !== moduleDir) {
      return {
        success: false,
        error: `ไม่อนุญาตให้รันสคริปต์นอกโฟลเดอร์โมดูล: ${scriptRelativePath}`,
      };
    }

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        error: `ไม่พบไฟล์สคริปต์: ${scriptRelativePath}`,
      };
    }

    // Only allow .ts and .js script executions
    const ext = path.extname(fullPath).toLowerCase();
    if (ext !== '.ts' && ext !== '.js') {
      return {
        success: false,
        error: `ชนิดไฟล์สคริปต์ไม่ถูกต้อง อนุญาตเฉพาะ .ts หรือ .js เท่านั้น (${ext})`,
      };
    }

    execSync(`npx ts-node "${fullPath}"`, {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env },
    });

    return { success: true };
  } catch (err: any) {
    const stderr = err.stderr?.toString() || err.message;
    return {
      success: false,
      error: `เกิดข้อผิดพลาดขณะประมวลผลสคริปต์ (${scriptRelativePath}): ${stderr}`,
    };
  }
}
