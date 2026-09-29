'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Trash2,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import ConfirmModal from '@/components/common/ConfirmModal';

interface CommentItem {
  id: string;
  postId: string;
  authorId: string | null;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarColor?: string;
    role?: string;
  } | null;
}

interface PostCommentsSectionProps {
  postId: string;
  postTitle?: string;
  className?: string;
  currentUser?: any;
  initialComments?: CommentItem[];
}

function formatThaiDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export default function PostCommentsSection({
  postId,
  postTitle,
  className = '',
  currentUser: initialUser,
  initialComments,
}: PostCommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments || []);
  const [isLoading, setIsLoading] = useState(!initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(initialUser || null);

  // Form states
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current user if not provided
  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    } else {
      setUser(initialUser);
    }
  }, [initialUser]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/modules/news/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
        }
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId && !initialComments) {
      fetchComments();
    }
  }, [postId, initialComments, fetchComments]);

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('กรุณากรอกข้อความแสดงความคิดเห็น');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/modules/news/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          authorName: user ? undefined : (guestName.trim() || 'ผู้เยี่ยมชม'),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น');
      }

      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setContent('');
      if (!user) setGuestName('');
      toast.success('ส่งความคิดเห็นเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      toast.error(err.message || 'ไม่สามารถส่งความคิดเห็นได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(
        `/api/modules/news/posts/${postId}/comments/${commentToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'ไม่สามารถลบความคิดเห็นได้');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
      toast.success('ลบความคิดเห็นเรียบร้อยแล้ว');
      setCommentToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if current user can delete a specific comment
  const canDeleteComment = (c: CommentItem) => {
    if (!user) return false;
    const isOwner = Boolean(c.authorId && c.authorId === user.id);
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role);
    return isOwner || isAdmin;
  };

  return (
    <section className={`font-prompt space-y-6 ${className}`}>
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-100/80 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>ความคิดเห็นและข้อเสนอแนะ</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/60">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ร่วมแลกเปลี่ยนความคิดเห็น สอบถาม หรือส่งข้อความถึงผู้เขียน
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchComments}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="รีเฟรชความคิดเห็น"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary-500' : ''}`} />
        </button>
      </div>

      {/* ── Add Comment Box ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none transition-all focus-within:ring-2 focus-within:ring-primary-500/10 focus-within:border-primary-400">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          {/* Identity Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            {user ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 ring-2 ring-primary-500/20"
                  style={{
                    backgroundColor: user.avatarColor || '#3b82f6',
                  }}
                >
                  {user.firstName?.[0] || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </span>
                    {user.role && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/60">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    แสดงความคิดเห็นในฐานะสมาชิกของระบบ
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-sm">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้แสดงความคิดเห็น (บุคคลภายนอก)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="ระบุชื่อของคุณ หรือปล่อยว่างไว้"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    maxLength={60}
                  />
                </div>
              </div>
            )}

            <span className="text-[11px] text-slate-400 font-mono">
              {content.length} / 1,000
            </span>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนความคิดเห็นของคุณที่นี่ (โปรดใช้ถ้อยคำที่สุภาพและสร้างสรรค์)..."
              maxLength={1000}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y min-h-[100px] leading-relaxed"
            />
          </div>

          {/* Toolbar & Submit */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ความคิดเห็นจะถูกเผยแพร่ทันทีหลังจากกดส่ง
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              {content.trim() && (
                <button
                  type="button"
                  onClick={() => setContent('')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ล้างข้อความ
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-md shadow-primary-500/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งความคิดเห็น</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Comments List ── */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="text-xs">กำลังโหลดความคิดเห็น...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const author = comment.author;
            const displayName = author
              ? `${author.firstName} ${author.lastName}`
              : comment.authorName || 'ผู้เยี่ยมชม';
            const avatarColor = author?.avatarColor || comment.authorAvatar || '#64748b';

            return (
              <div
                key={comment.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all space-y-3 group"
              >
                {/* Header: User Info & Timestamp */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-800"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {displayName[0] || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {displayName}
                        </span>
                        {author?.role && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50">
                            {author.role}
                          </span>
                        )}
                        {!author && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            ผู้เยี่ยมชม
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatThaiDateTime(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Delete if permitted) */}
                  {canDeleteComment(comment) && (
                    <button
                      type="button"
                      onClick={() => setCommentToDelete(comment)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      title="ลบความคิดเห็นนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Body Content */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-1 sm:pl-13">
                  {comment.content}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-14 px-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ยังไม่มีความคิดเห็น
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              ร่วมเป็นคนแรกที่แสดงความคิดเห็น สอบถาม หรือแลกเปลี่ยนมุมมองเกี่ยวกับข่าวสารนี้
            </p>
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      {commentToDelete && (
        <ConfirmModal
          isOpen={Boolean(commentToDelete)}
          title="ยืนยันการลบความคิดเห็น"
          message="คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
          onConfirm={handleConfirmDelete}
          onCancel={() => setCommentToDelete(null)}
          confirmText={isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
          cancelText="ยกเลิก"
          isDestructive={true}
        />
      )}
    </section>
  );
}
