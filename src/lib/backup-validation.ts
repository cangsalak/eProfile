import { z } from 'zod';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export const backupSystemRoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  displayName: z.string().optional(),
  description: z.string().nullable().optional(),
  permissions: z.union([z.string(), z.array(z.string())]).optional(),
  isSystem: z.boolean().optional().default(false),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupDepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  shortName: z.string().nullable().optional(),
  subDepartments: z.union([z.string(), z.array(z.string())]).optional(),
  sortOrder: z.number().int().optional().default(0),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupPersonnelSchema = z.object({
  id: z.string().min(1),
  badgeNo: z.string().optional().default(''),
  username: z.string().min(1),
  password: z.string().optional().default(''),
  role: z.string().optional().default('USER'),
  prefix: z.string().optional().default(''),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  position: z.string().optional().default(''),
  department: z.string().optional().default(''),
  subDepartment: z.string().optional().default(''),
  personnelType: z.string().optional().default('นายทหารสัญญาบัตร'),
  phone: z.string().optional().default(''),
  mobile: z.string().optional().default(''),
  email: z.string().optional().default(''),
  status: z.string().optional().default('ปฏิบัติงานปกติ'),
  avatarColor: z.string().optional().default('#3b82f6'),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  education: z.string().optional().default(''),
  experience: z.string().optional().default(''),
  notes: z.string().nullable().optional(),
  citizenId: z.string().optional().default(''),
  dateOfBirth: z.string().optional().default(''),
  bloodType: z.string().optional().default(''),
  religion: z.string().optional().default(''),
  officialId: z.string().optional().default(''),
  militaryBranch: z.string().optional().default(''),
  commissionDate: z.string().optional().default(''),
  currentAddress: z.string().optional().default(''),
  currentTambon: z.string().optional().default(''),
  currentAmphoe: z.string().optional().default(''),
  currentProvince: z.string().optional().default(''),
  currentZipcode: z.string().optional().default(''),
  emergencyContactName: z.string().optional().default(''),
  emergencyContactPhone: z.string().optional().default(''),
  emergencyContactRelation: z.string().optional().default(''),
  royalDecorations: z.string().optional().default(''),
  trainingHistory: z.string().optional().default(''),
  coverPhoto: z.string().optional().default(''),
  profileTheme: z.string().optional().default('indigo'),
  mustChangePassword: z.boolean().optional().default(true),
  failedLoginAttempts: z.number().int().optional().default(0),
  lockedUntil: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupVehicleSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  type: z.string().optional().default('รถยนต์'),
  licensePlate: z.string().min(1),
  brand: z.string().optional().default(''),
  model: z.string().optional().default(''),
  color: z.string().optional().default(''),
  photoFront: z.string().nullable().optional(),
  photoBack: z.string().nullable().optional(),
  photoSide: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupLeaveRecordSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  leaveType: z.string().min(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  reason: z.string().nullable().optional(),
  writtenAt: z.string().nullable().optional(),
  toPerson: z.string().nullable().optional(),
  contactAddress: z.string().nullable().optional(),
  contactTambon: z.string().nullable().optional(),
  contactAmphoe: z.string().nullable().optional(),
  contactProvince: z.string().nullable().optional(),
  status: z.string().optional().default('รออนุมัติ'),
  approvedById: z.string().nullable().optional(),
  approvedAt: z.string().or(z.date()).nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  approvalNote: z.string().nullable().optional(),
  substitutePerson: z.string().nullable().optional(),
  accumulatedLeaveDays: z.number().nullable().optional(),
  thisYearLeaveDays: z.number().nullable().optional(),
  totalLeaveDays: z.number().nullable().optional(),
  ordainedBefore: z.boolean().optional().default(false),
  ordainTempleName: z.string().nullable().optional(),
  ordainTempleLocation: z.string().nullable().optional(),
  ordainDate: z.string().or(z.date()).nullable().optional(),
  stayTempleName: z.string().nullable().optional(),
  stayTempleLocation: z.string().nullable().optional(),
  maternityLeaveTimes: z.number().nullable().optional(),
  maternityLeaveDays: z.number().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupNotificationSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1).optional(),
  recipientId: z.string().min(1).optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().optional().default('info'),
  link: z.string().nullable().optional(),
  isRead: z.boolean().optional().default(false),
  createdAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().nullable().optional().default('ข่าวทั่วไป'),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  authorId: z.string().min(1),
  published: z.boolean().optional().default(true),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupDocumentSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().min(1),
  category: z.string().optional().default('คำสั่ง'),
  filename: z.string().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  mimeType: z.string().optional().default('application/pdf'),
  fileType: z.string().optional(),
  size: z.number().nonnegative().optional().default(0),
  fileSize: z.number().nonnegative().optional(),
  storagePath: z.string().optional().default(''),
  fileUrl: z.string().optional(),
  uploadedBy: z.string().optional().default(''),
  notes: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  expiresAt: z.string().or(z.date()).nullable().optional(),
}).passthrough();

export const backupCalendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  type: z.string().optional().default('general'),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupContactMessageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string(),
  phone: z.string().nullable().optional(),
  message: z.string().min(1),
  status: z.string().optional().default('unread'),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
}).passthrough();

export const backupSystemSettingSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  value: z.string(),
}).passthrough();

export const backupAuditLogSchema = z.object({
  id: z.string().optional(),
  personnelId: z.string().nullable().optional(),
  action: z.string().min(1),
  entity: z.string().min(1),
  entityId: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
}).passthrough();

export const universalBackupPayloadSchema = z.object({
  app: z.string().optional().default('eProfile'),
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  data: z.object({
    systemRoles: z.array(backupSystemRoleSchema).optional().default([]),
    departments: z.array(backupDepartmentSchema).optional().default([]),
    personnel: z.array(backupPersonnelSchema).min(1, 'ข้อมูลสำรองต้องมีข้อมูลผู้ใช้งานอย่างน้อย 1 รายการ'),
    vehicles: z.array(backupVehicleSchema).optional().default([]),
    leaveRecords: z.array(backupLeaveRecordSchema).optional().default([]),
    leaveRequests: z.array(backupLeaveRecordSchema).optional(),
    notifications: z.array(backupNotificationSchema).optional().default([]),
    posts: z.array(backupPostSchema).optional().default([]),
    documents: z.array(backupDocumentSchema).optional().default([]),
    personnelDocuments: z.array(backupDocumentSchema).optional(),
    calendarEvents: z.array(backupCalendarEventSchema).optional().default([]),
    contactMessages: z.array(backupContactMessageSchema).optional().default([]),
    systemSettings: z.array(backupSystemSettingSchema).optional().default([]),
    auditLogs: z.array(backupAuditLogSchema).optional().default([]),
  }).passthrough(),
}).passthrough();

export function isValidBcryptHash(hash?: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  return BCRYPT_HASH_REGEX.test(hash.trim());
}
