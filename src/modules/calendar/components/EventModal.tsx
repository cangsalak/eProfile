'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEventItem, CALENDAR_CATEGORY_CONFIG, DEFAULT_DUTY_ROLES } from '../types';
import toast from 'react-hot-toast';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  AlignLeft,
  Tag,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEventItem | null;
  initialDate?: Date;
  initialHour?: number;
  onSave: (eventData: Partial<CalendarEventItem>) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialDate,
  initialHour,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(event && event.id && !event.id.startsWith('temp-'));
  const isReadOnly = event?.type === 'leave' || event?.type === 'google';

  const [title, setTitle] = useState('');
  const [type, setType] = useState('operation');
  const [allDay, setAllDay] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endDateStr, setEndDateStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [dutyRole, setDutyRole] = useState(DEFAULT_DUTY_ROLES[0] || 'นายทหารเวรผู้ใหญ่');
  const [dutyRoleOptions, setDutyRoleOptions] = useState<string[]>(DEFAULT_DUTY_ROLES);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch personnel list and configurable duty roles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPersonnel, resSettings] = await Promise.all([
          fetch('/api/personnel?limit=100'),
          fetch('/api/settings'),
        ]);

        if (resPersonnel.ok) {
          const data = await resPersonnel.json();
          setPersonnelList(data.data || data || []);
        }

        if (resSettings.ok) {
          const settingsData = await resSettings.json();
          if (settingsData.calendarDutyRoles) {
            try {
              const parsed = JSON.parse(settingsData.calendarDutyRoles);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setDutyRoleOptions(parsed);
              }
            } catch {
              // fallback to DEFAULT_ROLES
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch personnel or settings for calendar', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setType(event.type || 'operation');
      setLocation(event.location || '');
      setDescription(event.description || '');
      setStatus(event.status || 'active');
      setAssigneeId(event.assigneeId || '');
      setAssigneeName(event.assigneeName || '');
      setDutyRole(event.dutyRole || dutyRoleOptions[0] || DEFAULT_DUTY_ROLES[0]);

      const s = new Date(event.startDate);
      const e = new Date(event.endDate);

      setStartDateStr(format(s, 'yyyy-MM-dd'));
      setStartTimeStr(format(s, 'HH:mm'));
      setEndDateStr(format(e, 'yyyy-MM-dd'));
      setEndTimeStr(format(e, 'HH:mm'));
      setAllDay(Boolean(event.allDay || event.type === 'leave'));
    } else {
      // New Event Defaults
      const baseDate = initialDate || new Date();
      const hour = initialHour !== undefined ? initialHour : 9;
      const startH = hour.toString().padStart(2, '0');
      const endH = Math.min(23, hour + 1).toString().padStart(2, '0');

      setTitle('');
      setType('operation');
      setStartDateStr(format(baseDate, 'yyyy-MM-dd'));
      setStartTimeStr(`${startH}:00`);
      setEndDateStr(format(baseDate, 'yyyy-MM-dd'));
      setEndTimeStr(`${endH}:00`);
      setLocation('');
      setDescription('');
      setAssigneeId('');
      setAssigneeName('');
      setDutyRole(dutyRoleOptions[0] || DEFAULT_DUTY_ROLES[0]);
      setStatus('active');
      setAllDay(false);
    }
    setShowDeleteConfirm(false);
  }, [event, initialDate, initialHour, isOpen, dutyRoleOptions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);

      const startIso = allDay
        ? new Date(`${startDateStr}T00:00:00`).toISOString()
        : new Date(`${startDateStr}T${startTimeStr}:00`).toISOString();

      const endIso = allDay
        ? new Date(`${endDateStr || startDateStr}T23:59:59`).toISOString()
        : new Date(`${endDateStr || startDateStr}T${endTimeStr}:00`).toISOString();

      await onSave({
        id: event?.id,
        title: title.trim(),
        type,
        startDate: startIso,
        endDate: endIso,
        allDay,
        location: location.trim() || null,
        description: description.trim() || null,
        assigneeId: assigneeId || null,
        assigneeName: assigneeName || null,
        dutyRole: dutyRole || null,
        status,
      });

      onClose();
    } catch (err) {
      console.error('Failed to save calendar event', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(event.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete calendar event', err);
      toast.error('เกิดข้อผิดพลาดในการลบกิจกรรม');
    } finally {
      setIsDeleting(false);
    }
  };

  const catConfig = CALENDAR_CATEGORY_CONFIG[type] || CALENDAR_CATEGORY_CONFIG.general;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${catConfig.dotColor}`} />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {isReadOnly
                ? 'รายละเอียดกิจกรรม'
                : isEditing
                ? 'แก้ไขกิจกรรม / เวรปฏิบัติการ'
                : 'สร้างกิจกรรมใหม่'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Notice for Leave & Google feeds */}
        {isReadOnly && (
          <div className="bg-primary-50 dark:bg-primary-950/40 border-b border-primary-100 dark:border-primary-900/50 p-3 text-xs text-primary-800 dark:text-primary-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-400" />
            <span>
              {event?.type === 'leave'
                ? 'รายการนี้เป็นข้อมูลวันลาที่ได้รับการอนุมัติจากระบบกำลังพล'
                : 'รายการนี้ซิงค์มาจาก Google Calendar ผ่าน iCal Feed'}
            </span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อกิจกรรม / หัวข้อเวรปฏิบัติการ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เวรตรวจการประจำวัน, ประชุมฝ่ายปฏิบัติการ..."
              className="form-input w-full font-medium"
            />
          </div>

          {/* Category / Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              ประเภทกิจกรรม
            </label>
            {isReadOnly ? (
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {catConfig.label}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'operation', label: 'เวรปฏิบัติการ / ภารกิจ', dot: 'bg-sky-500' },
                  { id: 'meeting', label: 'การประชุม / นัดหมาย', dot: 'bg-violet-500' },
                  { id: 'notification', label: 'แจ้งเตือน / วันสำคัญ', dot: 'bg-amber-500' },
                  { id: 'general', label: 'กิจกรรมทั่วไป', dot: 'bg-slate-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      type === item.id
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between py-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 rounded-sm text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              ตลอดทั้งวัน (All Day)
            </label>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                วันและเวลาเริ่มต้น
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  disabled={isReadOnly}
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="form-input text-xs flex-1"
                />
                {!allDay && (
                  <input
                    type="time"
                    disabled={isReadOnly}
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="form-input text-xs w-24 font-mono"
                  />
                )}
              </div>
            </div>

            {/* End */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                วันและเวลาสิ้นสุด
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  disabled={isReadOnly}
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="form-input text-xs flex-1"
                />
                {!allDay && (
                  <input
                    type="time"
                    disabled={isReadOnly}
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="form-input text-xs w-24 font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Duty Assignee & Role */}
          {!isReadOnly && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="sm:col-span-1 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary-500" />
                  <span>ตำแหน่งหน้าที่</span>
                </label>
                <select
                  value={dutyRole}
                  onChange={(e) => setDutyRole(e.target.value)}
                  className="form-select text-xs w-full"
                >
                  {dutyRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  กำลังพลผู้ปฏิบัติหน้าที่ (Assignee)
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setAssigneeId(selectedId);
                    const found = personnelList.find((p) => p.id === selectedId);
                    if (found) {
                      setAssigneeName(`${found.prefix || ''}${found.firstName} ${found.lastName}`.trim());
                    } else {
                      setAssigneeName('');
                    }
                  }}
                  className="form-select text-xs w-full"
                >
                  <option value="">-- ระบุหรือไม่ระบุก็ได้ --</option>
                  {personnelList.map((p) => {
                    const fullName = `${p.prefix || ''}${p.firstName} ${p.lastName}`.trim();
                    return (
                      <option key={p.id} value={p.id}>
                        {fullName} {p.department ? `(${p.department})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              สถานที่ / ห้องปฏิบัติการ
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ห้องประชุม 1, ศปก.บก.ทท."
              className="form-input w-full text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              รายละเอียดเพิ่มเติม / คำสั่ง
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุกำหนดการและรายละเอียดงาน..."
              className="form-textarea w-full text-xs"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
          {isEditing && !isReadOnly && onDelete ? (
            showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 animate-in fade-in">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">ยืนยันลบ?</span>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors"
                >
                  {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบกิจกรรม</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              {isReadOnly ? 'ปิด' : 'ยกเลิก'}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
