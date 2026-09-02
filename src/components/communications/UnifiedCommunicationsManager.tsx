'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import TablePagination from '@/components/common/TablePagination';
import RichTextEditor from '@/components/common/RichTextEditor';
import DOMPurify from 'isomorphic-dompurify';

interface NotificationHistory {
  id: string;
  personnelId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category?: string;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: {
    firstName: string;
    lastName: string;
    avatarColor?: string;
  };
}

interface UnifiedCommunicationsProps {
  initialTab?: 'notifications' | 'posts';
}

export default function UnifiedCommunicationsManager({ initialTab = 'notifications' }: UnifiedCommunicationsProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'posts'>(initialTab);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ==========================================
  // TAB 1: NOTIFICATIONS (BROADCAST) STATES
  // ==========================================
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState(true);
  const [isNotifSubmitting, setIsNotifSubmitting] = useState(false);
  const [showNotifConfirm, setShowNotifConfirm] = useState(false);

  const [notifPage, setNotifPage] = useState(1);
  const [notifPageSize, setNotifPageSize] = useState(10);
  const [notifTotalItems, setNotifTotalItems] = useState(0);
  const [notifTotalPages, setNotifTotalPages] = useState(1);

  const [notifFormData, setNotifFormData] = useState({
    target: 'ALL',
    title: '',
    message: '',
    type: 'info',
    link: '',
  });

  // ==========================================
  // TAB 2: POSTS (NEWS & ARTICLES) STATES
  // ==========================================
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsSearchQuery, setPostsSearchQuery] = useState('');
  const [postsStatusFilter, setPostsStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const [postsPage, setPostsPage] = useState(1);
  const [postsPageSize, setPostsPageSize] = useState(10);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    category: 'ข่าวทั่วไป',
    content: '',
    image: '',
    published: true,
  });

  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  // ==========================================
  // INITIALIZATION: AUTH & SYSTEM SETTINGS
  // ==========================================
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch((err) => console.error('Auth error:', err));
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (settings?.defaultPageSize) {
          const size = parseInt(settings.defaultPageSize, 10);
          if (!isNaN(size) && size > 0) {
            setNotifPageSize(size);
            setPostsPageSize(size);
          }
        }
      })
      .catch((err) => console.error('Settings error:', err));
  }, []);

  // Check Permissions
  const canManagePosts = useMemo(() => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) return true;
    if (Array.isArray(currentUser.permissions) && currentUser.permissions.includes('MANAGE_POSTS')) {
      return true;
    }
    return false;
  }, [currentUser]);

  // ==========================================
  // NOTIFICATIONS FETCH & SUBMIT
  // ==========================================
  const fetchHistory = useCallback(async () => {
    try {
      setIsNotifLoading(true);
      const res = await fetch(`/api/notifications/history?page=${notifPage}&limit=${notifPageSize}`);
      if (res.ok) {
        const result = await res.json();
        if (result.data && result.pagination) {
          setHistory(result.data);
          setNotifTotalItems(result.pagination.total);
          setNotifTotalPages(result.pagination.totalPages);
        } else if (Array.isArray(result)) {
          setHistory(result);
          setNotifTotalItems(result.length);
          setNotifTotalPages(Math.ceil(result.length / notifPageSize) || 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('ไม่สามารถโหลดประวัติการประกาศได้');
    } finally {
      setIsNotifLoading(false);
    }
  }, [notifPage, notifPageSize]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifFormData.title.trim() || !notifFormData.message.trim()) {
      toast.error('กรุณากรอกหัวข้อและเนื้อหาประกาศ');
      return;
    }
    setShowNotifConfirm(true);
  };

  const executeNotifSubmit = async () => {
    setShowNotifConfirm(false);
    setIsNotifSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifFormData),
      });

      if (res.ok) {
        toast.success('ส่งประกาศและแจ้งเตือนสำเร็จ');
        setNotifFormData({
          target: 'ALL',
          title: '',
          message: '',
          type: 'info',
          link: '',
        });
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setNotifPage(1);
        fetchHistory();
      } else {
        const data = await res.json();
        toast.error(data.error || 'เกิดข้อผิดพลาดในการส่งประกาศ');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsNotifSubmitting(false);
    }
  };

  // ==========================================
  // POSTS FETCH & CRUD
  // ==========================================
  const fetchPosts = useCallback(async () => {
    try {
      setIsPostsLoading(true);
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      toast.error('ไม่สามารถโหลดรายการข่าวสารได้');
    } finally {
      setIsPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab, fetchPosts]);

  const handleOpenPostCreate = () => {
    setPostFormData({ title: '', category: 'ข่าวทั่วไป', content: '', image: '', published: true });
    setEditingPostId(null);
    setIsPostModalOpen(true);
  };

  const handleOpenPostEdit = (post: Post) => {
    setPostFormData({
      title: post.title,
      category: post.category || 'ข่าวทั่วไป',
      content: post.content,
      image: post.image || '',
      published: post.published,
    });
    setEditingPostId(post.id);
    setIsPostModalOpen(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postFormData.title.trim() || !postFormData.content.trim()) {
      toast.error('กรุณากรอกหัวข้อและเนื้อหาข่าวสาร');
      return;
    }

    try {
      setIsPostSubmitting(true);
      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postFormData),
      });

      if (res.ok) {
        toast.success(editingPostId ? 'แก้ไขข่าวสารสำเร็จ' : 'เผยแพร่ข่าวสารใหม่สำเร็จ');
        setIsPostModalOpen(false);
        setPostFormData({ title: '', category: 'ข่าวทั่วไป', content: '', image: '', published: true });
        setEditingPostId(null);
        fetchPosts();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'เกิดข้อผิดพลาดในการบันทึกข่าวสาร');
      }
    } catch (err) {
      console.error('Post submit error:', err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsPostSubmitting(false);
    }
  };

  const handlePostDelete = async () => {
    if (!deletingPost) return;
    try {
      const res = await fetch(`/api/posts/${deletingPost.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`ลบข่าวสาร "${deletingPost.title}" เรียบร้อย`);
        fetchPosts();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'ไม่สามารถลบข่าวสารได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingPost(null);
    }
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(postsSearchQuery.toLowerCase()) ||
        (post.author &&
          `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(postsSearchQuery.toLowerCase()));

      const matchStatus =
        postsStatusFilter === 'ALL' ||
        (postsStatusFilter === 'PUBLISHED' && post.published) ||
        (postsStatusFilter === 'DRAFT' && !post.published);

      return matchSearch && matchStatus;
    });
  }, [posts, postsSearchQuery, postsStatusFilter]);

  // Posts Pagination Calculation
  const postsTotalItems = filteredPosts.length;
  const postsTotalPages = Math.ceil(postsTotalItems / postsPageSize) || 1;
  const activePostsPage = Math.min(postsPage, postsTotalPages);
  const postsIndexOfFirstItem = (activePostsPage - 1) * postsPageSize;
  const postsIndexOfLastItem = Math.min(postsIndexOfFirstItem + postsPageSize, postsTotalItems);
  const currentPosts = filteredPosts.slice(postsIndexOfFirstItem, postsIndexOfLastItem);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> สำเร็จ
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> เตือน
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ด่วน/ข้อผิดพลาด
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ทั่วไป
          </span>
        );
    }
  };

  const getTargetLabel = (target: string) => {
    if (target === 'ALL') return 'ทุกคนในระบบ (Broadcast)';
    if (target === 'ADMIN') return 'เฉพาะผู้ดูแลระบบ (Admins)';
    return target;
  };

  const notifIndexOfFirstItem = (notifPage - 1) * notifPageSize;
  const notifIndexOfLastItem = notifIndexOfFirstItem + history.length;

  return (
    <div className="pb-16 space-y-6 animate-fade-in font-prompt">
      
      {/* Header Banner - Dashboard Style Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-200/50 via-primary-100/30 to-transparent dark:from-primary-950/40 dark:via-primary-900/20 dark:to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/20 text-white text-2xl font-bold">
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span>ศูนย์จัดการข่าวสารและการแจ้งเตือน (Communications & Broadcast Hub)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                จัดการข่าวสารและการแจ้งเตือน
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                รวมศูนย์ควบคุมการส่งข้อความแจ้งเตือนด่วน (Broadcast Notifications) และการเผยแพร่ข่าวสาร ประชาสัมพันธ์องค์กร (News & Articles) ไว้ในที่เดียว
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="relative z-10 px-6 sm:px-8 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white/60 dark:bg-slate-800/40'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-bell text-xs"></i>
            <span>📢 ประกาศแจ้งเตือนในระบบ (Broadcast)</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-mono">
              {notifTotalItems}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2.5 ${
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white/60 dark:bg-slate-800/40'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-newspaper text-xs"></i>
            <span>📰 ข่าวสารและบทความประชาสัมพันธ์ (News & Articles)</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
              {posts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: NOTIFICATIONS & BROADCAST CONTENT */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    สร้างประกาศแจ้งเตือนใหม่
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ส่งแจ้งเตือนด่วนไปยังกระดิ่งแจ้งเตือนของผู้ใช้</p>
                </div>
              </div>

              <form onSubmit={handleNotifSubmit} className="space-y-4">
                {/* Target Audience */}
                <div>
                  <label htmlFor="target-audience" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    กลุ่มเป้าหมายผู้รับ
                  </label>
                  <div className="relative">
                    <select
                      id="target-audience"
                      aria-label="กลุ่มเป้าหมายการแจ้งเตือน"
                      value={notifFormData.target}
                      onChange={(e) => setNotifFormData({ ...notifFormData, target: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none"
                    >
                      <option value="ALL">ทุกคนในระบบ (Broadcast)</option>
                      <option value="ADMIN">เฉพาะผู้ดูแลระบบ (Admins)</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="notif-type" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ระดับความสำคัญ (Type)
                  </label>
                  <div className="relative">
                    <select
                      id="notif-type"
                      aria-label="ระดับความสำคัญของการแจ้งเตือน"
                      value={notifFormData.type}
                      onChange={(e) => setNotifFormData({ ...notifFormData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none"
                    >
                      <option value="info">ทั่วไป (Info) - สีฟ้า</option>
                      <option value="success">สำเร็จ / อนุมัติ (Success) - สีเขียว</option>
                      <option value="warning">เตือน / สำคัญ (Warning) - สีส้ม</option>
                      <option value="error">ด่วนที่สุด / ผิดพลาด (Error) - สีแดง</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="notif-title" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    หัวข้อประกาศ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="notif-title"
                    aria-label="หัวข้อประกาศ"
                    type="text"
                    required
                    value={notifFormData.title}
                    onChange={(e) => setNotifFormData({ ...notifFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="เช่น แจ้งกำหนดการประชุม หรือ ประกาศวันหยุดทำการ"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="notif-message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    เนื้อหาประกาศ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="notif-message"
                    aria-label="เนื้อหาประกาศ"
                    required
                    rows={4}
                    value={notifFormData.message}
                    onChange={(e) => setNotifFormData({ ...notifFormData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    placeholder="กรอกรายละเอียดข้อความที่ต้องการแจ้งเตือนถึงผู้ใช้งาน..."
                  />
                </div>

                {/* Link */}
                <div>
                  <label htmlFor="notif-link" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ลิงก์ที่เกี่ยวข้อง <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-link absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      id="notif-link"
                      aria-label="ลิงก์ที่เกี่ยวข้อง"
                      type="text"
                      value={notifFormData.link}
                      onChange={(e) => setNotifFormData({ ...notifFormData, link: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      placeholder="เช่น /leave หรือ https://..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isNotifSubmitting}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isNotifSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>กำลังส่งประกาศ...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                        <span>ส่งประกาศแจ้งเตือน</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      ประวัติการส่งประกาศล่าสุด
                    </h2>
                    <p className="text-xs text-slate-400">รายการแจ้งเตือนทั้งหมดในฐานข้อมูล ({notifTotalItems.toLocaleString()} รายการ)</p>
                  </div>
                </div>

                <button
                  onClick={fetchHistory}
                  disabled={isNotifLoading}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                  title="รีเฟรชประวัติ"
                >
                  <i className={`fa-solid fa-rotate-right text-xs ${isNotifLoading ? 'animate-spin' : ''}`}></i>
                </button>
              </div>

              <div className="overflow-x-auto min-h-[300px] divide-y divide-slate-100 dark:divide-slate-800">
                {isNotifLoading ? (
                  <div className="flex flex-col justify-center items-center py-20 text-slate-400 space-y-3">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500"></i>
                    <p className="text-xs font-medium">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-20 text-slate-400 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                      <i className="fa-regular fa-folder-open opacity-40"></i>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">ยังไม่มีประวัติการประกาศ</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 whitespace-nowrap">วัน/เวลา</th>
                        <th className="px-4 py-3 whitespace-nowrap">เป้าหมาย</th>
                        <th className="px-4 py-3 whitespace-nowrap">ประเภท</th>
                        <th className="px-4 py-3">เนื้อหาประกาศ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-xs font-mono">
                            {new Date(item.createdAt).toLocaleString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {getTargetLabel(item.personnelId)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {getTypeBadge(item.type)}
                          </td>
                          <td className="px-4 py-3.5 min-w-[200px]">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {item.message}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Server-side Pagination */}
              <TablePagination
                isLoading={isNotifLoading}
                totalItems={notifTotalItems}
                indexOfFirstItem={notifIndexOfFirstItem}
                indexOfLastItem={notifIndexOfLastItem}
                currentPage={notifPage}
                totalPages={notifTotalPages}
                pageSize={notifPageSize}
                unitName="ประกาศ"
                setPageSize={(size) => {
                  setNotifPageSize(size);
                  setNotifPage(1);
                }}
                setCurrentPage={setNotifPage}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: POSTS (NEWS & ARTICLES) CONTENT */}
      {/* ======================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Filter and Search Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
              
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <label htmlFor="posts-search-input-unified" className="sr-only">ค้นหาข่าวสาร</label>
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  id="posts-search-input-unified"
                  aria-label="ค้นหาตามหัวข้อประกาศ, เนื้อหา หรือชื่อผู้เขียน"
                  type="text"
                  placeholder="ค้นหาตามหัวข้อประกาศ, เนื้อหา หรือชื่อผู้เขียน..."
                  value={postsSearchQuery}
                  onChange={(e) => setPostsSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-56">
                <label htmlFor="posts-status-filter-unified" className="sr-only">เลือกสถานะการเผยแพร่</label>
                <select
                  id="posts-status-filter-unified"
                  aria-label="เลือกสถานะการเผยแพร่"
                  value={postsStatusFilter}
                  onChange={(e) => setPostsStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
                >
                  <option value="ALL">📁 ทุกสถานะ ({posts.length})</option>
                  <option value="PUBLISHED">🟢 เผยแพร่แล้ว ({posts.filter((p) => p.published).length})</option>
                  <option value="DRAFT">🟡 ฉบับร่าง ({posts.filter((p) => !p.published).length})</option>
                </select>
              </div>

              {/* Create Button */}
              {canManagePosts && (
                <button
                  onClick={handleOpenPostCreate}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                  <span>เขียนข่าว/บทความใหม่</span>
                </button>
              )}
            </div>
          </div>

          {/* Posts Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                รายการข่าวสารและบทความ ({filteredPosts.length} รายการ)
              </div>
              <button
                onClick={fetchPosts}
                disabled={isPostsLoading}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                title="รีเฟรชข้อมูล"
              >
                <i className={`fa-solid fa-rotate-right text-xs ${isPostsLoading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 uppercase font-bold tracking-wider sticky top-0 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">หัวข้อข่าวสาร/บทความ</th>
                    <th className="py-3 px-4 whitespace-nowrap">ผู้เขียน</th>
                    <th className="py-3 px-4 whitespace-nowrap text-center">สถานะ</th>
                    <th className="py-3 px-4 whitespace-nowrap">วันที่สร้าง</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isPostsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500"></i>
                        <p className="text-xs">กำลังโหลดรายการข่าวสาร...</p>
                      </td>
                    </tr>
                  ) : currentPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto mb-2">
                          <i className="fa-regular fa-newspaper opacity-40"></i>
                        </div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">ยังไม่มีรายการข่าวสารในระบบ</p>
                      </td>
                    </tr>
                  ) : (
                    currentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 min-w-[240px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800/60">
                              {post.category || 'ข่าวทั่วไป'}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {post.title}
                          </div>
                          <div 
                            className="text-slate-400 text-xs mt-0.5 line-clamp-1"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/<[^>]+>/g, '')) }}
                          ></div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                              {post.author?.firstName ? post.author.firstName[0] : 'U'}
                            </div>
                            <span>
                              {post.author?.firstName} {post.author?.lastName || ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {post.published ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> เผยแพร่
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ฉบับร่าง
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                          {new Date(post.createdAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {canManagePosts ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenPostEdit(post)}
                                className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                                title="แก้ไขบทความ"
                              >
                                <i className="fa-solid fa-pen text-xs"></i>
                              </button>
                              <button
                                onClick={() => setDeletingPost(post)}
                                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors"
                                title="ลบบทความ"
                              >
                                <i className="fa-solid fa-trash text-xs"></i>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <TablePagination
              isLoading={isPostsLoading}
              totalItems={postsTotalItems}
              indexOfFirstItem={postsIndexOfFirstItem}
              indexOfLastItem={postsIndexOfLastItem}
              currentPage={activePostsPage}
              totalPages={postsTotalPages}
              pageSize={postsPageSize}
              unitName="บทความ"
              setPageSize={(size) => {
                setPostsPageSize(size);
                setPostsPage(1);
              }}
              setCurrentPage={setPostsPage}
            />
          </div>
        </div>
      )}

      {/* Post Modal Form */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">
                  <i className={editingPostId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'}></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingPostId ? 'แก้ไขข่าวสาร/บทความ' : 'เพิ่มข่าวสาร/บทความใหม่'}
                  </h3>
                  <p className="text-[11px] text-slate-400">ระบบจัดการเนื้อหาพร้อมเครื่องมือ Rich Text Tool Editor</p>
                </div>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="post-title-unified" className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    หัวข้อข่าวสาร <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="post-title-unified"
                    type="text"
                    required
                    value={postFormData.title}
                    onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                    placeholder="เช่น กำหนดการจัดกิจกรรมประจำปี 2569"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="post-category-unified" className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    หมวดหมู่/หัวข้อข่าว <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="post-category-unified"
                    type="text"
                    required
                    list="post-category-presets"
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    placeholder="เลือกหรือพิมพ์หมวดหมู่..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <datalist id="post-category-presets">
                    <option value="ข่าวทั่วไป" />
                    <option value="ประกาศสำคัญ" />
                    <option value="ข่าวกิจกรรม" />
                    <option value="จัดซื้อจัดจ้าง" />
                    <option value="สาระน่ารู้" />
                    <option value="คำสั่งและระเบียบ" />
                  </datalist>
                </div>
              </div>

              {/* Quick Category Selector Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">เลือกด่วน:</span>
                {['ข่าวทั่วไป', 'ประกาศสำคัญ', 'ข่าวกิจกรรม', 'จัดซื้อจัดจ้าง', 'สาระน่ารู้', 'คำสั่งและระเบียบ'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostFormData({ ...postFormData, category: cat })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      postFormData.category === cat
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="post-image-unified" className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ลิงก์รูปภาพหน้าปก / รูปภาพประกอบ <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <div className="relative">
                  <i className="fa-solid fa-image absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    id="post-image-unified"
                    type="text"
                    value={postFormData.image}
                    onChange={(e) => setPostFormData({ ...postFormData, image: e.target.value })}
                    placeholder="https://... หรือ /uploads/..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  เนื้อหาข่าวสาร/บทความ <span className="text-rose-500">*</span>
                </label>
                <RichTextEditor
                  value={postFormData.content}
                  onChange={(content) => setPostFormData({ ...postFormData, content })}
                  placeholder="เขียนเนื้อหา จัดรูปแบบข้อความ แทรกลิงก์ รูปภาพ และหัวข้อข่าวสาร..."
                  minHeight="260px"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="post-published-unified"
                  checked={postFormData.published}
                  onChange={(e) => setPostFormData({ ...postFormData, published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="post-published-unified" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  เผยแพร่ทันที (เปิดให้แสดงผลในหน้าข่าวสารและหน้าหลัก)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isPostSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isPostSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>บันทึกข้อมูล</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Confirm Modal */}
      <ConfirmModal
        isOpen={showNotifConfirm}
        title="ยืนยันการส่งประกาศแจ้งเตือน"
        message={`คุณต้องการส่งประกาศนี้ไปยัง "${notifFormData.target === 'ALL' ? 'ทุกคนในระบบ (Broadcast)' : 'เฉพาะผู้ดูแลระบบ (Admins)'}" ใช่หรือไม่?`}
        onConfirm={executeNotifSubmit}
        onCancel={() => setShowNotifConfirm(false)}
      />

      {/* Posts Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPost)}
        title="ยืนยันการลบข่าวสาร"
        message={`คุณต้องการลบข่าวสาร "${deletingPost?.title}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        onConfirm={handlePostDelete}
        onCancel={() => setDeletingPost(null)}
      />
    </div>
  );
}
