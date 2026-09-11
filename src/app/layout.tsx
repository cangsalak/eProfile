import './globals.css';
import React from 'react';
import ToastProvider from '../components/ToastProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ระบบฐานข้อมูลบุคลากร',
  description: 'ระบบจัดการฐานข้อมูลและสารสนเทศบุคลากร',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var pref = window.sessionStorage.getItem('user_theme_preference') || window.localStorage.getItem('user_theme_preference') || window.localStorage.getItem('darkMode') || window.localStorage.getItem('theme_mode');
                var isDark = pref ? (pref === 'dark' || pref === 'true') : true;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-color-scheme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-color-scheme', 'light');
                }
                var savedTheme = window.localStorage.getItem('theme');
                if (savedTheme) {
                  document.documentElement.setAttribute('data-theme', savedTheme);
                }
                var savedFont = window.localStorage.getItem('systemFont');
                if (savedFont) {
                  document.documentElement.setAttribute('data-font', savedFont);
                }
              } catch (e) {}

              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Loading chunk') || e.message.includes('ChunkLoadError') || e.message.includes('CSS_CHUNK_LOAD_FAILED'))) {
                  if (!window.sessionStorage.getItem('chunk_reload_lock')) {
                    window.sessionStorage.setItem('chunk_reload_lock', Date.now().toString());
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ToastProvider />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
