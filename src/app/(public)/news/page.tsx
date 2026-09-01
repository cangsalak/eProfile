import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

export const metadata = {
  title: 'ข่าวสารและบทความ - eProfile',
  description: 'ติดตามข่าวสารและบทความล่าสุดจากองค์กร',
};

// Add unstable_noStore for dynamic data fetching, or rely on revalidation
export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">ข่าวสารและบทความ</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">อัปเดตข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.id} href={`/news/${post.id}`} className="group block">
              <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/40 dark:shadow-none h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <i className="fa-regular fa-image text-4xl"></i>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold mb-2">ข่าวทั่วไป</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...') }}></p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-user-pen"></i>
                      <span>{post.author?.firstName} {post.author?.lastName}</span>
                    </div>
                    <div>
                      <i className="fa-regular fa-calendar mr-1"></i>
                      {new Date(post.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
          <i className="fa-regular fa-newspaper text-4xl text-slate-400 mb-4"></i>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">ยังไม่มีข่าวสาร</h3>
          <p className="text-slate-500">รอติดตามข่าวสารจากเราเร็วๆ นี้</p>
        </div>
      )}
    </div>
  );
}
