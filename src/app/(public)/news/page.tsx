import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

export const metadata = {
  title: 'ข่าวสารและบทความ - eProfile',
  description: 'ติดตามข่าวสารและบทความล่าสุดจากองค์กร',
};

export const dynamic = 'force-dynamic';

interface NewsPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const pageParam = searchParams?.page;
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const pageSize = 9;

  const totalPosts = await prisma.post.count({ where: { published: true } });
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      author: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  const totalPages = Math.ceil(totalPosts / pageSize) || 1;

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-prompt">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">ข่าวสารและบทความ</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">อัปเดตข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900">
                        {post.category || 'ข่าวทั่วไป'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h2>
                    <p 
                      className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1" 
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...') }}
                    ></p>
                    
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              {currentPage > 1 ? (
                <Link
                  href={`/news?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  <span>ก่อนหน้า</span>
                </Link>
              ) : (
                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed flex items-center gap-1.5">
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  <span>ก่อนหน้า</span>
                </span>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurrent = p === currentPage;
                  return (
                    <Link
                      key={p}
                      href={`/news?page=${p}`}
                      className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={`/news?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span>ถัดไป</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </Link>
              ) : (
                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed flex items-center gap-1.5">
                  <span>ถัดไป</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </span>
              )}
            </div>
          )}
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
