'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEventItem, CALENDAR_CATEGORY_CONFIG, DEFAULT_DUTY_ROLES } from '../types';
import toast from 'react-hot-toast';
import {
  Tag,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DatePicker } from '@/components/ui/DatePicker';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${catConfig.dotColor}`} />
          <span>
            {isReadOnly
              ? 'รายละเอียดกิจกรรม'
              : isEditing
              ? 'แก้ไขกิจกรรม / เวรปฏิบัติการ'
              : 'สร้างกิจกรรมใหม่'}
          </span>
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isEditing && !isReadOnly && onDelete && (
              <>
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    icon="fa-solid fa-trash-can"
                  >
                    ลบกิจกรรม
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>ยืนยันลบ?</span>
                    </span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                    >
                      ลบทันที
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {isReadOnly ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                form="event-form"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                icon="fa-solid fa-floppy-disk"
              >
                {isEditing ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-prompt">
        {/* Read-Only Notice for Leave & Google feeds */}
        {isReadOnly && (
          <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 rounded-xl p-3 text-xs text-primary-800 dark:text-primary-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-400" />
            <span>
              {event?.type === 'leave'
                ? 'รายการนี้เป็นข้อมูลวันลาที่ได้รับการอนุมัติจากระบบกำลังพล'
                : 'รายการนี้ซิงค์มาจาก Google Calendar ผ่าน iCal Feed'}
            </span>
          </div>
        )}

        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อกิจกรรม / หัวข้อเวรปฏิบัติการ <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              disabled={isReadOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เวรตรวจการประจำวัน, ประชุมฝ่ายปฏิบัติการ..."
              className="text-xs font-medium w-full"
            />
          </div>

          {/* Category / Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>ประเภทกิจกรรม</span>
            </label>
            {isReadOnly ? (
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2 select-none">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 rounded-sm text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span>ตลอดทั้งวัน (All Day)</span>
            </label>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                วันและเวลาเริ่มต้น
              </label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <DatePicker
                    id="event-startDate"
                    value={startDateStr}
                    onChange={(val) => setStartDateStr(val)}
                    disabled={isReadOnly}
                    placeholder="เลือกวันที่ (พ.ศ.)"
                    required
                  />
                </div>
                {!allDay && (
                  <Input
                    type="time"
                    disabled={isReadOnly}
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="text-xs w-24 font-mono"
                  />
                )}
              </div>
            </div>

            {/* End */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                วันและเวลาสิ้นสุด
              </label>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <DatePicker
                    id="event-endDate"
                    value={endDateStr}
                    onChange={(val) => setEndDateStr(val)}
                    disabled={isReadOnly}
                    placeholder="เลือกวันที่ (พ.ศ.)"
                    required
                  />
                </div>
                {!allDay && (
                  <Input
                    type="time"
                    disabled={isReadOnly}
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="text-xs w-24 font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Duty Assignee & Role */}
          {!isReadOnly && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="sm:col-span-1 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary-500" />
                  <span>ตำแหน่งหน้าที่</span>
                </label>
                <Select
                  value={dutyRole}
                  onChange={(e) => setDutyRole(e.target.value)}
                  options={dutyRoleOptions.map((r) => ({ value: r, label: r }))}
                  className="text-xs w-full"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  กำลังพลผู้ปฏิบัติหน้าที่ (Assignee)
                </label>
                <Select
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
                  options={[
                    { value: '', label: '-- ระบุหรือไม่ระบุก็ได้ --' },
                    ...personnelList.map((p) => ({
                      value: p.id,
                      label: `${p.prefix || ''}${p.firstName} ${p.lastName}${p.department ? ` (${p.department})` : ''}`.trim(),
                    })),
                  ]}
                  className="text-xs w-full"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              สถานที่ / ช่องทางประชุม
            </label>
            <Input
              type="text"
              disabled={isReadOnly}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ห้องประชุม 1, อาคารกองบัญชาการ, Google Meet..."
              className="text-xs w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              รายละเอียดเพิ่มเติม / คำสั่ง / บันทึก
            </label>
            <Textarea
              rows={3}
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อความหรือคำสั่งเพิ่มเติมสำหรับเวรหรือกิจกรรมนี้..."
              className="text-xs w-full resize-none"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};
