'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import {
  CreditCard,
  Palette,
  Printer,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Sliders,
  Eye,
  Repeat,
  FileCheck,
  Loader2,
  Maximize2,
} from 'lucide-react';
import IDBadge from '../components/IDBadge';
import { CR80_DIMENSIONS } from '../constants';
import toast from 'react-hot-toast';

type TabType = 'preview' | 'templates' | 'specs';

export default function BadgeStudioWidget() {
  const [settings, setSettings] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [settingsRes, meRes] = await Promise.all([
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' }),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData || {});
      }
      if (meRes.ok) {
        const uData = await meRes.json();
        if (uData?.user) {
          setCurrentUser(uData.user);
        }
      }
    } catch (err) {
      console.error('Failed to load badge widget data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fallback demo personnel if not logged in or avatar missing
  const displayPersonnel = useMemo(() => {
    if (currentUser) {
      return {
        id: currentUser.id || 'usr-sample',
        badgeNo: currentUser.badgeNo || currentUser.officialId || 'EP-100248',
        citizenId: currentUser.citizenId || '1100000000000',
        prefix: currentUser.prefix || 'ร.ต.อ.',
        firstName: currentUser.firstName || currentUser.name || 'พงศกร',
        lastName: currentUser.lastName || 'พัฒนารัฐ',
        personnelType: currentUser.personnelType || 'นายทหารสัญญาบัตร',
        position: currentUser.position || 'นายทหารสารบรรณ',
        department: settings.organizationName || currentUser.department || 'ศูนย์ฝึกทางยุทธวิธีกองทัพบก',
        subDepartment: currentUser.subDepartment || 'แผนกธุรการ',
        bloodType: currentUser.bloodType || 'O (Rh+)',
        phone: currentUser.phone || '02-123-4567',
        mobile: currentUser.mobile || '089-123-4567',
        email: currentUser.email || 'officer@eprofile.local',
        avatarColor: currentUser.avatarColor || currentUser.avatar || '',
      };
    }
    return {
      id: 'demo',
      badgeNo: 'EP-100248',
      citizenId: '1100000000000',
      prefix: 'ร.ต.อ.',
      firstName: 'พงศกร',
      lastName: 'พัฒนารัฐ',
      personnelType: 'นายทหารสัญญาบัตร',
      position: 'นายทหารสารบรรณ',
      department: settings.organizationName || 'ศูนย์ฝึกทางยุทธวิธีกองทัพบก',
      subDepartment: 'แผนกธุรการ',
      bloodType: 'O (Rh+)',
      phone: '02-123-4567',
      mobile: '089-123-4567',
      email: 'officer@eprofile.local',
      avatarColor: '',
    };
  }, [currentUser, settings]);

  const badgeTemplate = settings.badgeTemplate || 'canvas';

  const isLandscape = useMemo(() => {
    if (settings?.badgeOrientation === 'landscape') return true;
    if (settings?.badgeTemplate === 'canvas' || !settings?.badgeTemplate) {
      try {
        const cfg = JSON.parse(settings.badgeCanvasConfig || '[]');
        if (Array.isArray(cfg) && cfg.some((el: any) => el.id?.startsWith('ls-'))) return true;
      } catch {}
    }
    return false;
  }, [settings]);

  const templateLabel = 'สตูดิโอออกแบบ (Canvas Studio)';

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[420px] font-prompt">
      {/* Header */}
      <CardHeader
        title="ระบบบัตรประจำตัวและสตูดิโอ"
        subtitle="ออกแบบ พิมพ์บัตร 2 หน้า และบัตรดิจิทัลบุคลากร (CR80)"
        icon={<CreditCard className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูล"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/badges"
              title="เปิดศูนย์พิมพ์บัตร"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Active Template */}
          <div className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/50 text-center">
            <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300">
              รูปแบบที่เลือกใช้
            </span>
            <span className="text-xs sm:text-sm font-black text-primary-700 dark:text-primary-300 truncate block mt-0.5">
              {templateLabel}
            </span>
          </div>

          {/* Orientation */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
              ทิศทางการวาง
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono block mt-0.5">
              {isLandscape ? 'แนวนอน (Landscape)' : 'แนวตั้ง (Portrait)'}
            </span>
          </div>

          {/* Color Mode */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-center">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400">
              การคุมโทนสี
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block mt-0.5 truncate">
              {settings.badgeColorMode === 'custom' ? 'กำหนดสีเฉพาะ' : 'อิงชั้นยศ/สังกัด'}
            </span>
          </div>

          {/* Digital QR */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-center">
            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              QR ตรวจสอบบัตร
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
              พร้อมสแกนตรวจ
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>พรีวิวบัตรประจำตัว</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>รูปแบบ &amp; สตูดิโอ</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>มาตรฐาน CR80</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังโหลดสตูดิโอบัตร...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: BADGE LIVE PREVIEW */}
              {activeTab === 'preview' && (
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  {/* Side Switcher Pill */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewSide('front')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        previewSide === 'front'
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      ด้านหน้าบัตร
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSide('back')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        previewSide === 'back'
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      ด้านหลังบัตร
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSide((prev) => (prev === 'front' ? 'back' : 'front'))}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                      title="พลิกบัตร"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Scaled Container */}
                  <div className="relative flex items-center justify-center p-2 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-inner max-w-full overflow-hidden">
                    <div
                      className="transition-all duration-300 transform scale-[0.80] sm:scale-[0.88] origin-center shadow-lg rounded-[12px]"
                      style={{
                        width: isLandscape ? CR80_DIMENSIONS.landscapeWidth : CR80_DIMENSIONS.width,
                        height: isLandscape ? CR80_DIMENSIONS.landscapeHeight : CR80_DIMENSIONS.height,
                      }}
                    >
                      <IDBadge
                        personnel={displayPersonnel as any}
                        settings={settings}
                        qrValue={
                          typeof window !== 'undefined'
                            ? `${window.location.origin}/verify/${displayPersonnel.id}`
                            : 'EP-100248'
                        }
                        isBack={previewSide === 'back'}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    บัตรประจำตัวตัวอย่างสำหรับ {displayPersonnel.prefix} {displayPersonnel.firstName} {displayPersonnel.lastName} • แสดงผลตามเทมเพลตที่บันทึกไว้ในระบบ
                  </p>
                </div>
              )}

              {/* TAB 2: TEMPLATES & STUDIO */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-primary-500/40 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-pen-ruler text-primary-500 text-sm" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ระบบออกแบบบัตร Canvas Studio
                        </span>
                      </div>
                      <Badge variant="primary" size="sm" className="text-[10px]">
                        มาตรฐานหลักของระบบ
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      ระบบออกแบบบัตรอิสระแบบ WYSIWYG ตามสัดส่วนจริง CR80 รองรับการจัดวางรูปถ่าย บาร์โค้ด QR Code ตราสัญลักษณ์ และการแยกสีตามชั้นยศอัตโนมัติ
                    </p>
                    
                    {/* Rank Color Summary */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        การแยกสีตามชั้นยศ (Active Color Scheme):
                      </span>
                      {settings.badgeColorMode === 'custom' ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: settings.badgeCustomColor || '#4f46e5' }}
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            ใช้สีหลักเดียวทั้งองค์กร ({settings.badgeCustomColor || '#4f46e5'})
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: settings.colorCommissioned || '#dc2626' }}
                            />
                            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">สัญญาบัตร</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: settings.colorNonCommissioned || '#d97706' }}
                            />
                            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">ประทวน/ลูกจ้าง</span>
                          </div>
                          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: settings.colorConscript || '#16a34a' }}
                            />
                            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">กองประจำการ</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Studio Link Callout */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/10 to-transparent border border-primary-500/20 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        ต้องการปรับแต่งเทมเพลตหรือออกแบบใหม่?
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        เข้าสู่สตูดิโอออกแบบเพื่อจัดวางเลเยอร์ หรือเปลี่ยนข้อความหัวบัตรและตราสัญลักษณ์
                      </span>
                    </div>
                    <Link href="/modules/badges/settings">
                      <Button variant="primary" size="sm" className="text-xs shrink-0">
                        <Sliders className="w-3.5 h-3.5 mr-1" />
                        เปิดสตูดิโอ
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: SPECS & STANDARDS */}
              {activeTab === 'specs' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      มาตรฐานบัตรประจำตัว ISO/IEC 7810 ID-1 (CR80)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px]">ขนาดแนวตั้ง (Portrait):</span>
                        <strong className="text-slate-800 dark:text-slate-200">53.98 × 85.60 มม.</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px]">ขนาดแนวนอน (Landscape):</span>
                        <strong className="text-slate-800 dark:text-slate-200">85.60 × 53.98 มม.</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px]">ความหนาบัตร PVC:</span>
                        <strong className="text-slate-800 dark:text-slate-200">0.76 มม. (30 mil)</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-400 block text-[10px]">ระยะพับคู่หน้า-หลัง:</span>
                        <strong className="text-slate-800 dark:text-slate-200">0.05 มม. (ระยะเส้นพับ)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ระบบรองรับการพิมพ์คู่หน้า-หลัง (CR80 Pair) บนกระดาษ Photo หรือสติ๊กเกอร์พับประกบได้ทันที</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Link href="/modules/badges" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs">
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                พิมพ์บัตรกำลังพล (Bulk Print)
              </Button>
            </Link>
            <Link href="/modules/badges/my" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                บัตรของฉัน
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
