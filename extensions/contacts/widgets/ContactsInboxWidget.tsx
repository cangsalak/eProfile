'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button, Modal } from '@/components/ui';
import {
  Mail,
  Inbox,
  CheckCircle2,
  Clock,
  Phone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Eye,
  Send,
  MessageSquare,
  Building,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

type TabType = 'inbox' | 'analytics' | 'channels';

export default function ContactsInboxWidget() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [settings, setSettings] = useState<{
    organizationPhone?: string;
    contactEmail?: string;
    organizationName?: string;
  }>({});

  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [msgRes, setRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/settings'),
      ]);

      if (msgRes.ok) {
        const data = await msgRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData || {});
      }
    } catch (err) {
      console.error('Error fetching contacts in widget:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Status Metrics
  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === 'unread').length;
    const read = messages.filter((m) => m.status === 'read').length;
    const replied = messages.filter((m) => m.status === 'replied').length;
    const responseRate = total > 0 ? Math.round((replied / total) * 100) : 100;
    return { total, unread, read, replied, responseRate };
  }, [messages]);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(
          newStatus === 'replied'
            ? 'ทำเครื่องหมายว่าตอบกลับแล้ว'
            : newStatus === 'read'
            ? 'ทำเครื่องหมายว่าอ่านแล้ว'
            : 'เปลี่ยนสถานะเรียบร้อย'
        );
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      handleUpdateStatus(msg.id, 'read');
    }
  };

  const copyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/modules/contacts/public`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('คัดลอกลิงก์หน้าติดต่อสาธารณะแล้ว');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const recentMessages = useMemo(() => messages.slice(0, 4), [messages]);

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[400px] font-prompt">
      {/* Header */}
      <CardHeader
        title="กล่องข้อความติดต่อและสอบถาม"
        subtitle="ข้อความติดต่อและเรื่องร้องเรียนจากประชาชน/ภายนอก"
        icon={<Mail className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchContacts(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูล"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/contacts"
              title="เปิดกล่องข้อความเต็ม"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
        {/* KPI Stat Row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Total */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">ทั้งหมด</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
              {loading ? '...' : stats.total}
            </span>
          </div>

          {/* Unread */}
          <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 text-center relative overflow-hidden">
            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              {stats.unread > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
              )}
              ยังไม่อ่าน
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
              {loading ? '...' : stats.unread}
            </span>
          </div>

          {/* Read */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-center">
            <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">อ่านแล้ว</span>
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {loading ? '...' : stats.read}
            </span>
          </div>

          {/* Replied */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-center">
            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">ตอบกลับ</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? '...' : stats.replied}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>ข้อความล่าสุด</span>
            {stats.unread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {stats.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>สถิติการตอบสนอง</span>
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'channels'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>ช่องทางติดต่อ</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังโหลดข้อความ...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: INBOX */}
              {activeTab === 'inbox' && (
                <div className="space-y-2">
                  {recentMessages.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ยังไม่มีข้อความติดต่อเข้ามา
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        ข้อความจากหน้าเว็บสาธารณะจะปรากฏที่นี่
                      </p>
                    </div>
                  ) : (
                    recentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleOpenDetail(msg)}
                        className="group p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-2.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {msg.name}
                            </span>
                            {msg.status === 'unread' && (
                              <Badge variant="danger" size="sm" className="px-1.5 py-0 text-[10px]">
                                ใหม่
                              </Badge>
                            )}
                            {msg.status === 'replied' && (
                              <Badge variant="success" size="sm" className="px-1.5 py-0 text-[10px]">
                                ตอบแล้ว
                              </Badge>
                            )}
                            {msg.status === 'read' && (
                              <Badge variant="neutral" size="sm" className="px-1.5 py-0 text-[10px]">
                                อ่านแล้ว
                              </Badge>
                            )}
                            <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">
                              {formatThaiDate(msg.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 leading-relaxed">
                            {msg.message}
                          </p>

                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                            <span className="truncate flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="truncate flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                {msg.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0 mt-2" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-3.5">
                  {/* Response Rate Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        อัตราการตอบกลับ (Response Rate)
                      </span>
                      <span className="text-sm font-black text-primary-600 dark:text-primary-400 font-mono">
                        {stats.responseRate}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${stats.responseRate}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>เป้าหมายมาตรฐาน: &ge; 90%</span>
                      <span>ตอบแล้ว {stats.replied} จาก {stats.total} รายการ</span>
                    </div>
                  </div>

                  {/* Status Breakdown Alerts */}
                  <div className="space-y-2">
                    {stats.unread > 0 ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>มีข้อความรอการเปิดอ่าน <strong>{stats.unread}</strong> รายการ ควรเร่งดำเนินการ</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>ยอดเยี่ยม! ไม่มีข้อความค้างที่ยังไม่ได้อ่าน</span>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      💡 <strong>คำแนะนำการให้บริการ:</strong> ควรอัปเดตสถานะเป็น &quot;ตอบกลับแล้ว&quot; เมื่อเจ้าหน้าที่ได้ติดต่อกลับทางโทรศัพท์หรืออีเมลเรียบร้อย เพื่อให้สถิติแม่นยำ
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CHANNELS */}
              {activeTab === 'channels' && (
                <div className="space-y-3">
                  {/* Public Portal URL */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        หน้าแบบฟอร์มติดต่อสาธารณะ
                      </span>
                      <button
                        onClick={copyPublicLink}
                        className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>คัดลอกลิงก์</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all">
                      /modules/contacts/public
                    </div>
                  </div>

                  {/* Configured Contact Info */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      ข้อมูลติดต่อหลักของหน่วยงาน
                    </span>
                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{settings.organizationPhone || '02-123-4567'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{settings.contactEmail || 'contact@eprofile.com'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ระบบป้องกัน Spam Honeypot & Rate Limiting (5 คำขอ/นาที) ทำงานปกติ</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Link href="/modules/contacts" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs">
                <Inbox className="w-3.5 h-3.5 mr-1.5" />
                กล่องข้อความทั้งหมด
              </Button>
            </Link>
            <Link href="/modules/contacts/public" target="_blank" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                หน้าติดต่อสาธารณะ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Message Quick Preview Modal */}
      {selectedMessage && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMessage(null)}
          title="รายละเอียดข้อความติดต่อ"
          size="md"
        >
          <div className="space-y-4 font-prompt text-xs sm:text-sm">
            {/* Sender Metadata */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedMessage.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(selectedMessage.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-slate-600 dark:text-slate-300 text-xs">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMessage.email}</span>
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedMessage.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                เนื้อหาข้อความ:
              </label>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed min-h-[100px]">
                {selectedMessage.message}
              </div>
            </div>

            {/* Current Status & Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">สถานะ:</span>
                {selectedMessage.status === 'unread' && <Badge variant="danger">ยังไม่อ่าน</Badge>}
                {selectedMessage.status === 'read' && <Badge variant="warning">อ่านแล้ว</Badge>}
                {selectedMessage.status === 'replied' && <Badge variant="success">ตอบกลับแล้ว</Badge>}
              </div>

              <div className="flex items-center gap-2">
                {selectedMessage.status !== 'replied' ? (
                  <Button
                    variant="success"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    ทำเครื่องหมายว่าตอบแล้ว
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    เปลี่ยนเป็นอ่านแล้ว
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedMessage(null)}>
                  ปิด
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
