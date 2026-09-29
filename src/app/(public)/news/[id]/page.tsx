import React from 'react';
import { prisma } from '@/modules/core';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import PostShareBar from '@/modules/news/components/PostShareBar';
import PostCommentsSection from '@/modules/news/components/PostCommentsSection';

interface NewsDetailProps {
  params: { id: string };
}

export async function generateMetadata({ params }: NewsDetailProps) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} - eProfile News`,
    description: post.content.replace(/<[^>]+>/g, '').substring(0, 150),
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { firstName: true, lastName: true, avatarColor: true, role: true },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarColor: true, role: true },
          },
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // Calculate estimated reading time
  const wordCount = post.content.replace(/<[^>]+>/g, '').trim().length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 450));

  // Find related posts (latest 3 other published posts)
  const relatedPosts = await prisma.post.findMany({
    where: { published: true, id: { not: post.id } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      _count: { select: { comments: true } },
    },
  });

  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'ผู้ดูแลระบบ';
  const authorAvatarColor = post.author?.avatarColor || '#3b82f6';
  const initialChar = post.author?.firstName?.[0] || 'A';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-28 font-prompt selection:bg-primary-500 selection:text-white">
      {/* ── Top Ambient Atmosphere ── */}
      <div className="relative w-full overflow-hidden">
        {post.image ? (
          <div className="relative w-full h-80 sm:h-96 md:h-[460px] overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover object-center filter scale-102"
            />
            {/* Multi-layered cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30 backdrop-blur-[1px]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
          </div>
        ) : (
          <div className="relative w-full h-64 sm:h-72 md:h-80 bg-gradient-to-br from-primary-800 via-indigo-900 to-slate-950 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
          </div>
        )}
      </div>

      {/* ── Main Article Card Container ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 md:-mt-64 relative z-10">
        {/* Navigation Breadcrumb Pill */}
        <div className="mb-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 transition-all group"
          >
            <i className="fa-solid fa-arrow-left text-[11px] group-hover:-translate-x-1 transition-transform"></i>
            <span>กลับสู่หน้ารวมข่าวสารและบทความ</span>
          </Link>
        </div>

        {/* ── Editorial Paper Container ── */}
        <article className="bg-white/95 dark:bg-slate-900/95 rounded-[32px] shadow-2xl shadow-slate-300/40 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden backdrop-blur-xl">
          {/* Article Header Area */}
          <div className="p-6 sm:p-10 md:p-12 pb-8 border-b border-slate-100 dark:border-slate-800/80">
            {/* Meta tags: Category + Date + Read time */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
              <span className="px-3.5 py-1 rounded-full font-bold text-xs bg-primary-50 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 border border-primary-200/80 dark:border-primary-800 shadow-2xs">
                <i className="fa-solid fa-tag text-[10px] mr-1.5 opacity-80"></i>
                {post.category || 'ข่าวทั่วไป'}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <i className="fa-regular fa-calendar text-[11px] text-primary-500"></i>
                <span>
                  {new Date(post.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <i className="fa-regular fa-clock text-[11px] text-amber-500"></i>
                <span>อ่านประมาณ {readTimeMin} นาที</span>
              </span>

              {post._count?.comments ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  <i className="fa-regular fa-comment-dots text-[11px] text-emerald-500"></i>
                  <span>{post._count.comments} ความคิดเห็น</span>
                </span>
              ) : null}
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight mb-8">
              {post.title}
            </h1>

            {/* Author Executive Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0 ring-2 ring-white dark:ring-slate-700"
                  style={{ backgroundColor: authorAvatarColor }}
                >
                  {initialChar}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {authorName}
                    </span>
                    {post.author?.role && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    เจ้าหน้าที่ผู้เผยแพร่ข้อมูลข่าวสาร
                  </span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <i className="fa-solid fa-circle-check text-xs"></i>
                <span>เอกสารเผยแพร่ทางการ</span>
              </div>
            </div>
          </div>

          {/* Article Body Typography */}
          <div className="p-6 sm:p-10 md:p-12 space-y-12">
            <div
              className="prose prose-lg dark:prose-invert prose-primary max-w-none text-slate-800 dark:text-slate-200 leading-[1.8] font-prompt prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary-600 prose-a:font-semibold prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-6 prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/40 prose-blockquote:p-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Social Share Bar */}
            <div className="pt-6">
              <PostShareBar title={post.title} />
            </div>

            {/* Comments Section */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <PostCommentsSection
                postId={post.id}
                postTitle={post.title}
                initialComments={JSON.parse(JSON.stringify(post.comments || []))}
              />
            </div>
          </div>
        </article>
      </div>

      {/* ── Related Articles Section ── */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                บทความและข่าวสารที่เกี่ยวข้อง
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ติดตามข่าวสารและความเคลื่อนไหวอื่นๆ ที่น่าสนใจ
              </p>
            </div>
            <Link
              href="/news"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
            >
              <span>ดูทั้งหมด</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/news/${related.id}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {related.image ? (
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={related.image}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      alt={related.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-slate-800 dark:to-slate-850 flex items-center justify-center text-primary-400">
                    <i className="fa-regular fa-newspaper text-3xl"></i>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mb-2 border border-primary-200/60 dark:border-primary-800/60">
                      {related.category || 'ข่าวทั่วไป'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
                      {related.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(related.createdAt).toLocaleDateString('th-TH')}</span>
                    {related._count && related._count.comments > 0 && (
                      <span className="flex items-center gap-1 text-primary-500 font-semibold">
                        <i className="fa-regular fa-comment text-[10px]"></i>
                        <span>{related._count.comments}</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
