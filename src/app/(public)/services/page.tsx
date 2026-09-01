import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'บริการของเรา - eProfile',
  description: 'บริการและโซลูชันต่างๆ ที่เรามีให้',
};

// Next.js Server Component
export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">บริการของเรา</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">เลือกบริการที่เหมาะสมกับองค์กรของคุณ</p>
      </div>
      
      {services.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
              {service.image ? (
                <div className="aspect-video w-full relative">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-5xl text-primary-500">
                  <i className={`fa-solid ${service.icon || 'fa-layer-group'}`}></i>
                </div>
              )}
              
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">{service.description}</p>
                
                {service.price && (
                  <div className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                    {service.price}
                  </div>
                )}
                
                <Link 
                  href="/contact" 
                  className="w-full block text-center py-3 bg-slate-50 dark:bg-slate-700 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  สนใจบริการนี้
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
          <i className="fa-solid fa-box-open text-4xl text-slate-400 mb-4"></i>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">ยังไม่มีข้อมูลบริการ</h3>
          <p className="text-slate-500">รอผู้ดูแลระบบเพิ่มข้อมูลบริการเร็วๆ นี้</p>
        </div>
      )}
    </div>
  );
}
