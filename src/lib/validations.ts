import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้/เลขประจำตัว').max(100),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน').max(200),
});

/**
 * Password Policy:
 * - อย่างน้อย 8 ตัวอักษร
 * - มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว
 * - มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว
 * - มีตัวเลข (0-9) อย่างน้อย 1 ตัว
 */
export const passwordPolicySchema = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .max(128, 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร')
  .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว')
  .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว')
  .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');

export const personnelRegistrationSchema = z.object({
  citizenId: z.string().min(13, 'รหัสประจำตัวประชาชนต้องมี 13 หลัก').max(13),
  password: passwordPolicySchema.optional(),
  firstName: z.string().min(2, 'กรุณากรอกชื่อ').max(100),
  lastName: z.string().min(2, 'กรุณากรอกนามสกุล').max(100),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  // additional fields for admin updates or profile updates can be added here
}).passthrough();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: passwordPolicySchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านใหม่ไม่ตรงกัน',
  path: ['confirmPassword'],
});

export const contactSchema = z.object({
  name: z.string().min(2, 'กรุณากรอกชื่อ').max(100),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  message: z.string().min(10, 'ข้อความต้องมีความยาวอย่างน้อย 10 ตัวอักษร').max(2000),
});

export const installRequestSchema = z.object({
  firstName: z.string().trim().min(1, 'กรุณากรอกชื่อผู้ดูแลระบบ').max(100),
  lastName: z.string().trim().min(1, 'กรุณากรอกนามสกุลผู้ดูแลระบบ').max(100),
  citizenId: z.string().trim().regex(/^\d{13}$/, 'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น'),
  badgeNo: z.string().trim().regex(/^\d{10}$/, 'หมายเลขประจำตัวทหาร/เจ้าหน้าที่ต้องเป็นตัวเลข 10 หลักเท่านั้น'),
  password: passwordPolicySchema,
  setupSecret: z.string().optional(),
  systemName: z.string().max(200).optional(),
  organizationName: z.string().max(200).optional(),
  organizationAddress: z.string().max(500).optional(),
  organizationPhone: z.string().max(100).optional(),
  contactPhoneSecondary: z.string().max(100).optional(),
  contactEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100).optional().or(z.literal('')),
  contactEmailSupport: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100).optional().or(z.literal('')),
  contactMapEmbedUrl: z.string().max(2000).optional().or(z.literal('')),
  contactMapLink: z.string().max(2000).optional().or(z.literal('')),
  dbProvider: z.enum(['sqlite', 'postgresql', 'mysql']).optional().default('sqlite'),
  dbConnectionString: z.string().max(1000).optional().default(''),
  installDemoData: z.boolean().optional().default(false),
  theme: z.string().max(50).optional().default('dark'),
});

