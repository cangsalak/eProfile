'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Personnel } from '@/modules/users';
import IDBadge from '../components/IDBadge';
import CR80Pair from '../components/CR80Pair';
import PrintPreviewModal from '@/modules/print/components/PrintPreviewModal';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Button, Badge, Card } from '@/components/ui';

export default function MyBadgesView() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'pair' | 'front' | 'back'>('pair');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      router.push('/login');
    }

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-xs text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลบัตรประจำตัว...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-prompt max-w-5xl mx-auto">
      {/* Submenu Slots in Universal Header */}
      <PageHeaderExtra>
        <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <Link
            href="/modules/badges"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-print text-xs text-slate-400"></i>
            <span>พิมพ์บัตรประจำตัว</span>
          </Link>
          <Link
            href="/modules/badges/settings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60"
          >
            <i className="fa-solid fa-palette text-xs text-slate-400"></i>
            <span>สตูดิโอออกแบบบัตร</span>
          </Link>
          <Link
            href="/modules/badges/my"
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-primary-600 text-white shadow-sm shadow-primary-500/30"
          >
            <i className="fa-solid fa-address-card text-xs"></i>
            <span>บัตรของฉัน</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* Control Panel Card (Hidden on Print) */}
      <Card className="no-print print:hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-address-card" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                บัตรประจำตัว: {currentUser.prefix || ''}{currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.position || 'เจ้าหน้าที่'} • {currentUser.department || 'หน่วยงานต้นสังกัด'}
              </p>
            </div>
          </div>

          {/* Print Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold no-print">
            <button
              type="button"
              onClick={() => setPrintMode('pair')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                printMode === 'pair'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>พิมพ์คู่หน้า-หลัง (ระยะ 0.05mm)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('front')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                printMode === 'front'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>เฉพาะหน้า</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('back')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                printMode === 'back'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>เฉพาะหลัง</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon="fa-solid fa-eye"
              onClick={() => setIsPreviewOpen(true)}
            >
              ดูตัวอย่างก่อนพิมพ์
            </Button>
            <Button
              variant="primary"
              size="md"
              icon="fa-solid fa-print"
              onClick={() => setIsPreviewOpen(true)}
            >
              สั่งพิมพ์บัตร (Print)
            </Button>
          </div>
        </div>
      </Card>

      {/* Badge View Area (Printable) */}
      <div id="printable-badge-sheet" className="badge-print-container p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 print:bg-transparent print:border-none print:p-0 print:m-0 print:shadow-none print:rounded-none flex justify-center">
        {printMode === 'pair' ? (
          <CR80Pair
            front={
              <IDBadge
                personnel={currentUser}
                settings={settings}
                qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
              />
            }
            back={
              <IDBadge
                personnel={currentUser}
                settings={settings}
                qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
                isBack={true}
              />
            }
          />
        ) : (
          <div className="relative p-2 border border-dashed border-slate-300 dark:border-slate-700 print:border-none print:p-0 rounded-2xl bg-white dark:bg-slate-900 shadow-sm print:shadow-none">
            <IDBadge
              personnel={currentUser}
              settings={settings}
              qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
              isBack={printMode === 'back'}
            />
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirmPrint={() => window.print()}
        title={`บัตรประจำตัว: ${currentUser.prefix || ''}${currentUser.firstName} ${currentUser.lastName}`}
        paperSettings={{
          pageSize: 'A4',
          orientation: 'portrait',
          margin: '8mm',
          showGaruda: false,
          watermark: 'none',
          showSignature: false,
          unitName: currentUser.department || '',
        }}
      >
        <div className="p-6 flex flex-col items-center">
          {printMode === 'pair' ? (
            <CR80Pair
              showCropMarks={false}
              front={
                <IDBadge
                  personnel={currentUser}
                  settings={settings}
                  qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
                />
              }
              back={
                <IDBadge
                  personnel={currentUser}
                  settings={settings}
                  qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
                  isBack={true}
                />
              }
            />
          ) : (
            <IDBadge
              personnel={currentUser}
              settings={settings}
              qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${currentUser.id}` : ''}
              isBack={printMode === 'back'}
            />
          )}
        </div>
      </PrintPreviewModal>
    </div>
  );
}
