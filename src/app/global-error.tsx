'use client';

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="th">
      <head>
        <title>ระบบพบข้อผิดพลาดร้ายแรง - eProfile</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300 mb-3">
            CRITICAL APPLICATION ERROR
          </span>

          <h1 className="text-xl font-bold text-white mb-2">
            เกิดข้อผิดพลาดระดับโครงสร้างหลัก
          </h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            ระบบไม่สามารถเรนเดอร์โครงสร้างหน้าเว็บได้ กรุณากดรีโหลดหน้าเว็บ หรือลองใหม่อีกครั้ง
          </p>

          {error.digest && (
            <div className="mb-6 p-2 rounded-xl bg-slate-800/80 text-[11px] font-mono text-slate-400">
              Digest: {error.digest}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
            >
              ลองใหม่อีกครั้ง
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
