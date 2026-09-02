import { Prisma, PrismaClient } from '@prisma/client';
import { getClientIp } from './audit';

export interface ApproverScope {
  isGlobalViewer: boolean;
  userRole: string;
  userDepartment: string | null;
  userSubDepartment: string | null;
  allowedDepartment?: string;
  allowedSubDepartment?: string;
}

export const ALLOWED_LEAVE_TYPES = [
  'ลาพักผ่อน',
  'ลากิจ',
  'ลาป่วย',
  'ลาคลอดบุตร',
  'ลาอุปสมบท',
  'ไปช่วยราชการ',
] as const;

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScopeError';
  }
}

export class ForbiddenActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenActionError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Resolves the strict scope of an approver.
 * Global scope is ONLY granted to allowlisted roles: SUPER_ADMIN, ADMIN, HR_MANAGER.
 * COMMANDER and DEPARTMENT_COMMANDER must have non-empty department/subDepartment.
 */
export function resolveApproverScope(
  userRole: string,
  userProfile: { department: string | null; subDepartment: string | null } | null
): { scope?: ApproverScope; error?: string } {
  const globalRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'];
  const isGlobalViewer = globalRoles.includes(userRole);

  const dept = userProfile?.department?.trim() || '';
  const subDept = userProfile?.subDepartment?.trim() || '';

  if (isGlobalViewer) {
    return {
      scope: {
        isGlobalViewer: true,
        userRole,
        userDepartment: dept || null,
        userSubDepartment: subDept || null,
      },
    };
  }

  // Scoped roles: DEPARTMENT_COMMANDER
  if (userRole === 'DEPARTMENT_COMMANDER') {
    if (!dept || dept === '-') {
      return {
        error: 'ไม่สามารถดำเนินการได้: บัญชีผู้บังคับบัญชาของคุณยังไม่ได้ถูกกำหนดหน่วยงานสังกัด กรุณาติดต่อผู้ดูแลระบบ',
      };
    }
    return {
      scope: {
        isGlobalViewer: false,
        userRole,
        userDepartment: dept,
        userSubDepartment: subDept || null,
        allowedDepartment: dept,
      },
    };
  }

  // Scoped roles: COMMANDER or custom roles with APPROVE_LEAVE
  if (!dept || dept === '-') {
    return {
      error: 'ไม่สามารถดำเนินการได้: บัญชีผู้บังคับบัญชาของคุณยังไม่ได้ถูกกำหนดหน่วยงานสังกัด กรุณาติดต่อผู้ดูแลระบบ',
    };
  }

  if (!subDept || subDept === '-') {
    return {
      error: 'ไม่สามารถดำเนินการได้: บัญชีผู้บังคับบัญชาหน่วยย่อยของคุณยังไม่ได้ถูกกำหนดแผนก/หน่วยย่อยสังกัด กรุณาติดต่อผู้ดูแลระบบ',
    };
  }

  return {
    scope: {
      isGlobalViewer: false,
      userRole,
      userDepartment: dept,
      userSubDepartment: subDept,
      allowedDepartment: dept,
      allowedSubDepartment: subDept,
    },
  };
}

/**
 * Checks if a specific leave request falls strictly within an approver's scope.
 */
export function isLeaveInApproverScope(
  leavePersonnel: { department: string; subDepartment?: string | null },
  scope: ApproverScope
): boolean {
  if (scope.isGlobalViewer) return true;

  if (scope.allowedDepartment && leavePersonnel.department !== scope.allowedDepartment) {
    return false;
  }

  if (scope.allowedSubDepartment && leavePersonnel.subDepartment !== scope.allowedSubDepartment) {
    return false;
  }

  return true;
}

/**
 * Process Leave Approval or Rejection inside a Prisma Transaction.
 * Ensures atomic conditional state update, notification creation, and audit logging.
 */
export async function executeLeaveApprovalWorkflow({
  prismaTx,
  req,
  authUser,
  leaveId,
  action,
  reason,
  note,
}: {
  prismaTx: Prisma.TransactionClient;
  req?: Request;
  authUser: { id: string; role: string; username: string };
  leaveId: string;
  action: 'approve' | 'reject';
  reason?: string;
  note?: string;
}) {
  // 1. Fetch Target Leave Record
  const leave = await prismaTx.leaveRecord.findUnique({
    where: { id: leaveId },
    include: {
      personnel: {
        select: {
          id: true,
          prefix: true,
          firstName: true,
          lastName: true,
          department: true,
          subDepartment: true,
          position: true,
        },
      },
    },
  });

  if (!leave) {
    throw new NotFoundError('ไม่พบข้อมูลใบลา');
  }

  // 2. Concurrency / Status Check
  if (leave.status !== 'รออนุมัติ') {
    throw new ConflictError(`ใบลาได้รับการดำเนินการหรือเปลี่ยนสถานะไปแล้ว (สถานะปัจจุบัน: ${leave.status})`);
  }

  // 3. Approver Scope Verification
  const userProfile = await prismaTx.personnel.findUnique({
    where: { id: authUser.id },
    select: { department: true, subDepartment: true, role: true },
  });

  const { scope, error: scopeError } = resolveApproverScope(authUser.role, userProfile);
  if (scopeError || !scope) {
    throw new ScopeError(scopeError || 'ไม่มีสิทธิ์เข้าถึงข้อมูลเนื่องจากไม่พบสังกัดที่ถูกต้อง');
  }

  if (!isLeaveInApproverScope(leave.personnel, scope)) {
    throw new ScopeError('ไม่มีสิทธิ์ดำเนินการใบลาของกำลังพลนอกหน่วยงานหรือหน่วยย่อยที่รับผิดชอบ');
  }

  // 4. Self-Approval Check
  const isSelfApproval = leave.personnelId === authUser.id;
  if (isSelfApproval && authUser.role !== 'SUPER_ADMIN') {
    throw new ForbiddenActionError('ไม่อนุญาตให้อนุมัติหรือปฏิเสธใบลาของตนเอง');
  }

  // 5. Conditional Atomic Update inside Transaction
  const targetStatus = action === 'approve' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ';
  const approvedAt = new Date();

  const updateResult = await prismaTx.leaveRecord.updateMany({
    where: {
      id: leaveId,
      status: 'รออนุมัติ',
    },
    data: {
      status: targetStatus,
      approvedById: authUser.id,
      approvedAt,
      rejectionReason: action === 'reject' ? reason || null : null,
      approvalNote: note || null,
    },
  });

  if (updateResult.count === 0) {
    throw new ConflictError('ใบลาได้รับการดำเนินการหรือเปลี่ยนสถานะโดยผู้อื่นแล้ว');
  }

  // 6. Fetch the updated leave record to get exact timestamp from DB
  const updatedLeave = await prismaTx.leaveRecord.findUnique({
    where: { id: leaveId },
    include: {
      personnel: {
        select: {
          id: true,
          prefix: true,
          firstName: true,
          lastName: true,
          department: true,
          subDepartment: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          prefix: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // 7. Notification creation inside Transaction
  const applicantName = `${leave.personnel.prefix || ''}${leave.personnel.firstName} ${leave.personnel.lastName}`.trim();
  const formattedStartDate = new Date(leave.startDate).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedEndDate = new Date(leave.endDate).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const notifTitle = action === 'approve'
    ? `ใบลาได้รับการอนุมัติแล้ว (${leave.leaveType})`
    : `ใบลาไม่ได้รับการอนุมัติ (${leave.leaveType})`;

  const notifMessage = action === 'approve'
    ? `ใบลาประเภท "${leave.leaveType}" ช่วงวันที่ ${formattedStartDate} ถึง ${formattedEndDate} ได้รับการอนุมัติเรียบร้อยแล้ว`
    : `ใบลาประเภท "${leave.leaveType}" ช่วงวันที่ ${formattedStartDate} ถึง ${formattedEndDate} ไม่ได้รับการอนุมัติ เนื่องจาก: ${reason}`;

  await prismaTx.notification.create({
    data: {
      personnelId: leave.personnelId,
      title: notifTitle,
      message: notifMessage,
      type: action === 'approve' ? 'success' : 'error',
      link: '/leave',
      isRead: false,
    },
  });

  // 8. AuditLog creation inside Transaction
  const ipAddress = req ? getClientIp(req) : '127.0.0.1';
  await prismaTx.auditLog.create({
    data: {
      personnelId: authUser.id,
      action: action === 'approve' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      entity: 'LeaveRecord',
      entityId: leaveId,
      details: JSON.stringify({
        leaveId,
        leaveType: leave.leaveType,
        applicantId: leave.personnelId,
        applicantName,
        applicantDepartment: leave.personnel.department,
        applicantSubDepartment: leave.personnel.subDepartment,
        previousStatus: 'รออนุมัติ',
        newStatus: targetStatus,
        rejectionReason: action === 'reject' ? reason : null,
        approvalNote: note || null,
        selfApproval: isSelfApproval,
        approvedAt: updatedLeave?.approvedAt?.toISOString() || approvedAt.toISOString(),
      }),
      ipAddress,
    },
  });

  return {
    success: true,
    message: action === 'approve' ? 'อนุมัติใบลาเรียบร้อยแล้ว' : 'บันทึกการไม่อนุมัติใบลาเรียบร้อยแล้ว',
    data: {
      id: leaveId,
      status: targetStatus,
      approvedAt: updatedLeave?.approvedAt?.toISOString() || approvedAt.toISOString(),
      approvedById: authUser.id,
      rejectionReason: action === 'reject' ? reason : null,
      approvalNote: note || null,
    },
  };
}
