'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Badge, Button, Modal } from '@/components/ui';
import {
  Megaphone,
  Bell,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import PostShareBar from '../components/PostShareBar';
import PostCommentsSection from '../components/PostCommentsSection';

interface PostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  image?: string | null;
  published: boolean;
  createdAt: string;
  author?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  _count?: {
    comments?: number;
  };
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

type NewsWidgetTab = 'news' | 'notifications' | 'broadcast';

function formatThaiDate(dateInput?: string): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getNotificationTypeMeta(type: string) {
  switch (type) {
    case 'success':
      return { icon: 'fa-solid fa-circle-check', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' };
    case 'warning':
      return { icon: 'fa-solid fa-triangle-exclamation', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' };
    case 'error':
      return { icon: 'fa-solid fa-circle-exclamation', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' };
    default:
      return { icon: 'fa-solid fa-circle-info', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' };
  }
}

function getCategoryBadgeVariant(cat?: string): 'primary' | 'candy' | 'warning' | 'info' | 'success' {
  switch (cat) {
    case 'คำสั่ง':
      return 'danger' as any;
    case 'ด่วน':
      return 'warning';
    case 'ประชาสัมพันธ์':
      return 'info';
    case 'กิจกรรม':
      return 'candy';
    default:
      return 'primary';
  }
}

export default function NewsAnnouncementsWidget() {
  const [activeTab, setActiveTab] = useState<NewsWidgetTab>('news');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Post Preview Modal
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  // Quick Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'ADMIN'>('ALL');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'success'>('info');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [postsRes, notifRes] = await Promise.all([
        fetch('/api/modules/news/posts?published=true').then((r) => r.ok ? r.json() : []),
        fetch('/api/modules/news/notifications').then((r) => r.ok ? r.json() : []),
      ]);

      if (Array.isArray(postsRes)) {
        setPosts(postsRes.slice(0, 4));
      }
      if (Array.isArray(notifRes)) {
        setNotifications(notifRes.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load news widget data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/modules/news/notifications', { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setBroadcastSuccess(null);
    setBroadcastError(null);

    try {
      const res = await fetch('/api/modules/news/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          type: broadcastType,
          targetType: broadcastTarget,
          channels: ['in_app'],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setBroadcastSuccess('ส่งประกาศบรอดแคสต์สำเร็จแล้ว');
        setBroadcastTitle('');
        setBroadcastMessage('');
        loadData(true);
      } else {
        setBroadcastError(json.error || 'เกิดข้อผิดพลาดในการส่งประกาศ');
      }
    } catch (err: any) {
      setBroadcastError(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[380px] font-prompt">
      <CardHeader
        title="ข่าวสารและการแจ้งเตือน"
        subtitle="ประกาศสำคัญและกล่องข้อความ"
        icon={<Megaphone className="w-5 h-5 text-white" />}
        iconGradient="from-blue-500 to-indigo-600"
        action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link href="/modules/news">
              <Button type="button" variant="secondary" size="xs" icon="fa-solid fa-arrow-right">
                กระดานข่าว
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
        {/* ── Segmented Tab Selector ── */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'news'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-newspaper text-[11px]"></i>
            <span>ข่าวสารล่าสุด</span>
            {posts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 text-[10px] flex items-center justify-center font-mono">
                {posts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-bell text-[11px]"></i>
            <span>การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
              activeTab === 'broadcast'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-paper-plane text-[11px]"></i>
            <span>ประกาศด่วน</span>
          </button>
        </div>

        {/* ── Tab Content ── */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">กำลังโหลดข่าวสารและข้อความ...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* ════════ TAB 1: LATEST NEWS ════════ */}
            {activeTab === 'news' && (
              <div className="space-y-2">
                {posts.length > 0 ? (
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {post.image ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                              <i className="fa-solid fa-bullhorn text-sm"></i>
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge variant={getCategoryBadgeVariant(post.category)} size="xs">
                                {post.category || 'ข่าวทั่วไป'}
                              </Badge>
                              <span className="text-[10px] text-slate-400">
                                {formatThaiDate(post.createdAt)}
                              </span>
                              {post._count && (post._count.comments ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-primary-500 font-semibold">
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  <span>{post._count.comments}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {post.title}
                            </h4>
                          </div>
                        </div>

                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 dark:text-slate-600 shrink-0 group-hover:translate-x-0.5 transition-transform"></i>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <i className="fa-solid fa-newspaper text-2xl mb-2 text-slate-300 dark:text-slate-600 block"></i>
                    ยังไม่มีข่าวสารหรือประกาศในระบบ
                  </div>
                )}
              </div>
            )}

            {/* ════════ TAB 2: MY NOTIFICATIONS ════════ */}
            {activeTab === 'notifications' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    รายการแจ้งเตือนล่าสุด
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <i className="fa-solid fa-check-double text-[10px]"></i>
                      <span>อ่านทั้งหมด</span>
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-1.5">
                    {notifications.map((notif) => {
                      const meta = getNotificationTypeMeta(notif.type);
                      return (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2.5 ${
                            notif.isRead
                              ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-white dark:bg-slate-850 border-primary-200 dark:border-primary-800/60 shadow-xs text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                              <i className={`${meta.icon} text-xs`}></i>
                            </div>
                            <div className="min-w-0">
                              <p className={`truncate ${notif.isRead ? 'font-medium' : 'font-bold'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {notif.message}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatThaiDate(notif.createdAt)}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <i className="fa-solid fa-bell-slash text-2xl mb-2 text-slate-300 dark:text-slate-600 block"></i>
                    ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                  </div>
                )}
              </div>
            )}

            {/* ════════ TAB 3: QUICK BROADCAST ════════ */}
            {activeTab === 'broadcast' && (
              <form onSubmit={handleSendBroadcast} className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    หัวข้อประกาศ / การแจ้งเตือน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แจ้งเตือนประชุมด่วนประจำสัปดาห์..."
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="form-input text-xs rounded-xl w-full"
                    disabled={isBroadcasting}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    ข้อความรายละเอียด <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="ระบุข้อความรายละเอียดที่ต้องการแจ้งกำลังพล..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="form-textarea text-xs rounded-xl w-full"
                    disabled={isBroadcasting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      กลุ่มเป้าหมาย
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value as any)}
                      className="form-select text-xs rounded-xl w-full"
                      disabled={isBroadcasting}
                    >
                      <option value="ALL">ทุกคนในระบบ (ALL)</option>
                      <option value="ADMIN">เฉพาะผู้ดูแลระบบ (ADMIN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      ระดับความสำคัญ
                    </label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="form-select text-xs rounded-xl w-full"
                      disabled={isBroadcasting}
                    >
                      <option value="info">ทั่วไป (Info)</option>
                      <option value="warning">ด่วน / เตือน (Warning)</option>
                      <option value="success">สำเร็จ (Success)</option>
                    </select>
                  </div>
                </div>

                {broadcastSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                {broadcastError && (
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{broadcastError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="xs"
                  className="w-full justify-center"
                  icon={isBroadcasting ? undefined : 'fa-solid fa-paper-plane'}
                  disabled={isBroadcasting}
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      กำลังส่งบรอดแคสต์...
                    </>
                  ) : (
                    'ส่งประกาศบรอดแคสต์ทันที'
                  )}
                </Button>
              </form>
            )}

            {/* ── Bottom Action Links ── */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Link href="/modules/news/inbox" className="block w-full">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-bell"
                >
                  กล่องการแจ้งเตือน
                </Button>
              </Link>
              <Link href="/modules/news" className="block w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-full justify-center"
                  icon="fa-solid fa-newspaper"
                >
                  จัดการข่าวสาร
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Read Modal ── */}
      {selectedPost && (
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title={selectedPost.title}
          subtitle={`หมวดหมู่: ${selectedPost.category || 'ข่าวทั่วไป'} • เผยแพร่เมื่อ ${formatThaiDate(selectedPost.createdAt)}`}
          icon="fa-solid fa-newspaper"
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Link href={`/news/${selectedPost.id}`} target="_blank">
                <Button variant="secondary" size="xs" icon="fa-solid fa-arrow-up-right-from-square">
                  เปิดอ่านหน้าเว็บเต็ม
                </Button>
              </Link>
              <Button variant="secondary" size="xs" onClick={() => setSelectedPost(null)}>
                ปิด
              </Button>
            </div>
          }
        >
          <div className="space-y-6 font-prompt text-xs sm:text-sm">
            {selectedPost.image && (
              <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                ผู้ประกาศ: {selectedPost.author?.firstName || 'ผู้ดูแลระบบ'} {selectedPost.author?.lastName || ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatThaiDate(selectedPost.createdAt)}
              </span>
            </div>

            {/* Social Share Bar */}
            <PostShareBar
              title={selectedPost.title}
              url={typeof window !== 'undefined' ? `${window.location.origin}/news/${selectedPost.id}` : undefined}
            />

            {/* Comments Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <PostCommentsSection
                postId={selectedPost.id}
                postTitle={selectedPost.title}
              />
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
