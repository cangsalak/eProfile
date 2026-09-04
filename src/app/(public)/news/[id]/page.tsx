import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

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
        select: { firstName: true, lastName: true, avatarColor: true }
      }
    }
  });

  if (!post || !post.published) {
    notFound();
  }

  // Find related posts (simply the latest 3 other posts)
  const relatedPosts = await prisma.post.findMany({
    where: { published: true, id: { not: post.id } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Cover Image */}
      {post.image ? (
        <div className="w-full h-64 md:h-96 relative">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-32 md:h-48 bg-primary-600 dark:bg-primary-900"></div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-32 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3.5 py-1 rounded-full font-bold text-xs border border-primary-200 dark:border-primary-800">
              {post.category || 'ข่าวทั่วไป'}
            </span>
            <span className="flex items-center gap-2">
              <i className="fa-regular fa-calendar"></i>
              {new Date(post.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 pb-8 border-b border-slate-100 dark:border-slate-800 mb-8">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: post.author?.avatarColor || '#3b82f6' }}
            >
              {post.author?.firstName?.[0] || 'A'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'ผู้ดูแลระบบ'}
              </p>
              <p className="text-xs text-slate-500">ผู้เขียน</p>
            </div>
          </div>

          <div 
            className="prose prose-lg dark:prose-invert prose-primary max-w-none prose-img:rounded-2xl prose-headings:font-bold"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">บทความที่เกี่ยวข้อง</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedPosts.map(related => (
              <Link key={related.id} href={`/news/${related.id}`} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                {related.image ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img src={related.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={related.title} />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                    <i className="fa-regular fa-image text-2xl"></i>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">{related.title}</h4>
                  <p className="text-xs text-slate-500">{new Date(related.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
