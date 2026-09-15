'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PageHeaderExtra } from '@/components/layout/PageHeaderContext';
import { Modal, Button } from '@/components/ui';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string | null;
  image?: string | null;
  icon?: string | null;
  published: boolean;
  order: number;
}

interface SiteFormState {
  // Home Page
  homeBadgeText?: string;
  homeTitleLine1?: string;
  homeTitleLine2?: string;
  homeSubtitle?: string;
  homeCtaPrimaryText?: string;
  homeCtaSecondaryText?: string;
  homeFeaturesTitle?: string;
  homeFeaturesSubtitle?: string;
  homeFeature1Icon?: string;
  homeFeature1Title?: string;
  homeFeature1Desc?: string;
  homeFeature2Icon?: string;
  homeFeature2Title?: string;
  homeFeature2Desc?: string;
  homeFeature3Icon?: string;
  homeFeature3Title?: string;
  homeFeature3Desc?: string;

  // About Page
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutVisionTitle?: string;
  aboutVisionContent?: string;
  aboutImage?: string;
  aboutMissionTitle?: string;
  aboutMission1Icon?: string;
  aboutMission1Title?: string;
  aboutMission1Desc?: string;
  aboutMission2Icon?: string;
  aboutMission2Title?: string;
  aboutMission2Desc?: string;
  aboutMission3Icon?: string;
  aboutMission3Title?: string;
  aboutMission3Desc?: string;

  // Contact Page
  contactTitle?: string;
  contactSubtitle?: string;
  organizationName?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  contactPhoneSecondary?: string;
  contactEmail?: string;
  contactEmailSupport?: string;
  contactWorkingHours?: string;
  contactMapEmbedUrl?: string;
  contactMapLink?: string;

  // Services Page Header
  servicesTitle?: string;
  servicesSubtitle?: string;

  // SEO & Social
  siteMetaTitle?: string;
  siteMetaDescription?: string;
  siteKeywords?: string;
  socialFacebook?: string;
  socialLine?: string;
  socialYoutube?: string;
  socialTwitter?: string;
}

const DEFAULT_CONTENT: SiteFormState = {
  homeBadgeText: 'ระบบจัดการบุคลากรรุ่นใหม่',
  homeTitleLine1: 'ยกระดับการบริหาร',
  homeTitleLine2: 'ทรัพยากรบุคคล',
  homeSubtitle: 'แพลตฟอร์มที่รวมทุกฟีเจอร์ที่คุณต้องการ สำหรับการบริหารจัดการบุคลากร การลา และการสื่อสารภายในองค์กร',
  homeCtaPrimaryText: 'เริ่มต้นใช้งาน',
  homeCtaSecondaryText: 'เข้าสู่ระบบสมาชิก',
  homeFeaturesTitle: 'จุดเด่นของระบบ eProfile',
  homeFeaturesSubtitle: 'ครบจบในที่เดียว ด้วยโมดูลที่ออกแบบมาเพื่อลดเวลาทำงานของฝ่ายบริหารและเพิ่มความสะดวกสบายให้บุคลากร',
  homeFeature1Icon: 'fa-solid fa-users',
  homeFeature1Title: 'จัดการข้อมูลบุคลากร',
  homeFeature1Desc: 'จัดเก็บข้อมูลประวัติอย่างเป็นระบบ ค้นหาง่าย พิมพ์บัตรประจำตัวได้ทันที',
  homeFeature2Icon: 'fa-solid fa-calendar-check',
  homeFeature2Title: 'ระบบการลาออนไลน์',
  homeFeature2Desc: 'ยื่นใบลาและอนุมัติผ่านระบบได้ทุกที่ พร้อมพิมพ์ใบลาตามแบบฟอร์ม',
  homeFeature3Icon: 'fa-solid fa-shield-halved',
  homeFeature3Title: 'ความปลอดภัยระดับสูง',
  homeFeature3Desc: 'เข้ารหัสข้อมูลตามมาตรฐาน พร้อมระบบกำหนดสิทธิ์การเข้าถึงแบบละเอียด',

  aboutTitle: 'เกี่ยวกับองค์กร',
  aboutSubtitle: 'มุ่งมั่นพัฒนาทรัพยากรบุคคล ด้วยเทคโนโลยีที่ทันสมัย',
  aboutVisionTitle: 'วิสัยทัศน์ของเรา (Vision)',
  aboutVisionContent: 'เรามุ่งมั่นที่จะเป็นผู้นำในการให้บริการและพัฒนาทรัพยากรบุคคล ด้วยการนำเทคโนโลยีสมัยใหม่มาประยุกต์ใช้ เพื่อสร้างสภาพแวดล้อมการทำงานที่ดีและมีประสิทธิภาพสูงสุดให้กับบุคลากรทุกคนในองค์กร',
  aboutImage: '',
  aboutMissionTitle: 'พันธกิจ (Mission)',
  aboutMission1Icon: 'fa-solid fa-bolt',
  aboutMission1Title: 'รวดเร็ว',
  aboutMission1Desc: 'ลดขั้นตอนและระยะเวลาในการดำเนินงานด้านเอกสารและการอนุมัติ',
  aboutMission2Icon: 'fa-solid fa-shield-halved',
  aboutMission2Title: 'ปลอดภัย',
  aboutMission2Desc: 'รักษาความปลอดภัยของข้อมูลบุคคลตามมาตรฐานสูงสุด',
  aboutMission3Icon: 'fa-solid fa-arrows-rotate',
  aboutMission3Title: 'ทันสมัย',
  aboutMission3Desc: 'พัฒนาและปรับปรุงระบบอย่างต่อเนื่องเพื่อตอบสนองการทำงานยุคดิจิทัล',

  contactTitle: 'ติดต่อเรา',
  contactSubtitle: 'หากมีข้อสงสัยหรือต้องการความช่วยเหลือ สามารถติดต่อเราได้ตลอดเวลาทำการ',
  organizationName: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร',
  organizationAddress: 'เลขที่ 123 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
  organizationPhone: '02-123-4567',
  contactPhoneSecondary: '02-123-4568',
  contactEmail: 'contact@eprofile.local',
  contactEmailSupport: 'support@eprofile.local',
  contactWorkingHours: 'จันทร์ – ศุกร์: 08:30 – 16:30 น. (หยุดวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์)',
  contactMapEmbedUrl: '',
  contactMapLink: '',

  servicesTitle: 'บริการของเรา',
  servicesSubtitle: 'ระบบงานและบริการต่างๆ ที่เปิดให้บุคลากรและหน่วยงานใช้งาน',

  siteMetaTitle: 'eProfile — ระบบบริหารจัดการบุคลากร',
  siteMetaDescription: 'ระบบฐานข้อมูลและงานบริการบุคลากรอิเล็กทรอนิกส์',
  siteKeywords: 'eprofile, บุคลากร, ระบบการลา, ทะเบียนประวัติ',
  socialFacebook: '',
  socialLine: '',
  socialYoutube: '',
  socialTwitter: '',
};

type TabKey = 'home' | 'about' | 'contact' | 'services' | 'seo';

export default function SiteView() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [formData, setFormData] = useState<SiteFormState>(DEFAULT_CONTENT);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Service Modal state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, servicesRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/services?all=true'),
      ]);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setFormData((prev) => ({
          ...prev,
          ...settings,
        }));
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.data || []);
      }
    } catch (error) {
      console.error('Failed to load site content:', error);
      toast.error('ไม่สามารถโหลดข้อมูลเนื้อหาเว็บไซต์ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleChange = (field: keyof SiteFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success('บันทึกการเปลี่ยนแปลงเนื้อหาเว็บไซต์เรียบร้อยแล้ว');
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // Service CRUD operations
  const handleSaveService = async (serviceData: Partial<ServiceItem>) => {
    try {
      const isNew = !editingService?.id;
      const url = isNew ? '/api/services' : `/api/services/${editingService.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save service');
      }

      toast.success(isNew ? 'เพิ่มบริการใหม่สำเร็จ' : 'แก้ไขบริการสำเร็จ');
      setIsServiceModalOpen(false);
      setEditingService(null);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกบริการ');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service');
      toast.success('ลบบริการเรียบร้อยแล้ว');
      setDeletingServiceId(null);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบบริการได้');
    }
  };

  const handleTogglePublishService = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !service.published }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(service.published ? 'ปิดการแสดงผลบริการแล้ว' : 'เผยแพร่บริการแล้ว');
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถอัปเดตสถานะบริการได้');
    }
  };

  const TABS = [
    { id: 'home' as TabKey, label: 'หน้าแรก (Home)', icon: 'fa-solid fa-house' },
    { id: 'about' as TabKey, label: 'เกี่ยวกับเรา (About)', icon: 'fa-solid fa-circle-info' },
    { id: 'contact' as TabKey, label: 'ติดต่อเรา (Contact)', icon: 'fa-solid fa-address-book' },
    { id: 'services' as TabKey, label: 'บริการ (Services)', icon: 'fa-solid fa-layer-group' },
    { id: 'seo' as TabKey, label: 'SEO & โซเชียล', icon: 'fa-solid fa-globe' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      {/* Header Slot with Live Preview links */}
      <PageHeaderExtra>
        <div className="flex items-center gap-2 p-1 bg-white/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 text-white shadow-sm shadow-primary-500/30 flex items-center gap-2">
            <i className="fa-solid fa-window-maximize text-xs"></i>
            <span>จัดการเว็บไซต์ (CMS)</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="ดูหน้าแรกของเว็บจริง"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-primary-500"></i>
            <span className="hidden sm:inline">ดูหน้าเว็บจริง</span>
          </Link>
        </div>
      </PageHeaderExtra>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-semibold border border-primary-100 dark:border-primary-900/50">
              <i className="fa-solid fa-pen-nib"></i>
              Website Content Manager
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              จัดการเนื้อหาและข้อความบนเว็บไซต์
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              ปรับแต่งข้อความ รูปภาพ แบนเนอร์ ข้อมูลติดต่อ และบริการต่างๆ ที่แสดงบนหน้าเว็บหลัก
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon="fa-solid fa-floppy-disk"
              isLoading={isSaving}
              loadingText="กำลังบันทึก..."
              onClick={() => handleSaveSettings()}
            >
              บันทึกการเปลี่ยนแปลงทั้งหมด
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/25 ring-1 ring-primary-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <i className={`${tab.icon} ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}></i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500 mb-2"></i>
          <p className="text-xs text-slate-400">กำลังโหลดเนื้อหาเว็บไซต์...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Hero Banner Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn text-primary-500"></i>
                    <span>Hero Section (แบนเนอร์หน้าแรก)</span>
                  </h3>
                  <Link href="/" target="_blank" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <span>ดูตัวอย่าง</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ข้อความป้ายกำกับ (Badge)</label>
                    <input
                      type="text"
                      className="form-input text-xs"
                      value={formData.homeBadgeText || ''}
                      onChange={(e) => handleChange('homeBadgeText', e.target.value)}
                      placeholder="เช่น ระบบจัดการบุคลากรรุ่นใหม่"
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ปุ่ม CTA หลัก (Primary Action)</label>
                    <input
                      type="text"
                      className="form-input text-xs"
                      value={formData.homeCtaPrimaryText || ''}
                      onChange={(e) => handleChange('homeCtaPrimaryText', e.target.value)}
                      placeholder="เช่น เริ่มต้นใช้งานฟรี"
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">หัวข้อหลัก บรรทัดที่ 1 (Title 1)</label>
                    <input
                      type="text"
                      className="form-input text-xs"
                      value={formData.homeTitleLine1 || ''}
                      onChange={(e) => handleChange('homeTitleLine1', e.target.value)}
                      placeholder="เช่น ยกระดับการบริหาร"
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">หัวข้อหลัก บรรทัดที่ 2 (Title 2 Highlight)</label>
                    <input
                      type="text"
                      className="form-input text-xs"
                      value={formData.homeTitleLine2 || ''}
                      onChange={(e) => handleChange('homeTitleLine2', e.target.value)}
                      placeholder="เช่น ทรัพยากรบุคคล"
                    />
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">คำอธิบายใต้หัวข้อ (Subtitle)</label>
                    <textarea
                      rows={3}
                      className="form-textarea text-xs"
                      value={formData.homeSubtitle || ''}
                      onChange={(e) => handleChange('homeSubtitle', e.target.value)}
                      placeholder="คำอธิบายสรุปสั้นๆ เกี่ยวกับระบบ"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Main Features */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-star text-amber-500"></i>
                    <span>จุดเด่น 3 ข้อหลัก (3 Core Features)</span>
                  </h3>
                  <p className="text-xs text-slate-400">แสดงผลเป็นการ์ดจุดเด่น 3 ใบใต้ Hero Section</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Feature 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-xs text-primary-600 dark:text-primary-400">จุดเด่นที่ 1</div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">FontAwesome Icon</label>
                      <input
                        type="text"
                        className="form-input text-xs font-mono"
                        value={formData.homeFeature1Icon || ''}
                        onChange={(e) => handleChange('homeFeature1Icon', e.target.value)}
                        placeholder="fa-solid fa-users"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">หัวข้อ</label>
                      <input
                        type="text"
                        className="form-input text-xs"
                        value={formData.homeFeature1Title || ''}
                        onChange={(e) => handleChange('homeFeature1Title', e.target.value)}
                        placeholder="จัดการข้อมูลบุคลากร"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">คำอธิบาย</label>
                      <textarea
                        rows={2}
                        className="form-textarea text-xs"
                        value={formData.homeFeature1Desc || ''}
                        onChange={(e) => handleChange('homeFeature1Desc', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-xs text-primary-600 dark:text-primary-400">จุดเด่นที่ 2</div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">FontAwesome Icon</label>
                      <input
                        type="text"
                        className="form-input text-xs font-mono"
                        value={formData.homeFeature2Icon || ''}
                        onChange={(e) => handleChange('homeFeature2Icon', e.target.value)}
                        placeholder="fa-solid fa-calendar-check"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">หัวข้อ</label>
                      <input
                        type="text"
                        className="form-input text-xs"
                        value={formData.homeFeature2Title || ''}
                        onChange={(e) => handleChange('homeFeature2Title', e.target.value)}
                        placeholder="ระบบการลาออนไลน์"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">คำอธิบาย</label>
                      <textarea
                        rows={2}
                        className="form-textarea text-xs"
                        value={formData.homeFeature2Desc || ''}
                        onChange={(e) => handleChange('homeFeature2Desc', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="font-bold text-xs text-primary-600 dark:text-primary-400">จุดเด่นที่ 3</div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">FontAwesome Icon</label>
                      <input
                        type="text"
                        className="form-input text-xs font-mono"
                        value={formData.homeFeature3Icon || ''}
                        onChange={(e) => handleChange('homeFeature3Icon', e.target.value)}
                        placeholder="fa-solid fa-shield-halved"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">หัวข้อ</label>
                      <input
                        type="text"
                        className="form-input text-xs"
                        value={formData.homeFeature3Title || ''}
                        onChange={(e) => handleChange('homeFeature3Title', e.target.value)}
                        placeholder="ความปลอดภัยระดับสูง"
                      />
                    </div>
                    <div className="form-control">
                      <label className="text-[11px] text-slate-500">คำอธิบาย</label>
                      <textarea
                        rows={2}
                        className="form-textarea text-xs"
                        value={formData.homeFeature3Desc || ''}
                        onChange={(e) => handleChange('homeFeature3Desc', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-building text-primary-500"></i>
                  <span>เนื้อหาหน้าเกี่ยวกับเรา (About Page)</span>
                </h3>
                <Link href="/about" target="_blank" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  <span>ดูตัวอย่างหน้า /about</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">หัวเรื่องหน้า (Page Title)</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.aboutTitle || ''}
                    onChange={(e) => handleChange('aboutTitle', e.target.value)}
                    placeholder="เกี่ยวกับองค์กร"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">คำโปรยใต้หัวข้อ (Subtitle)</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.aboutSubtitle || ''}
                    onChange={(e) => handleChange('aboutSubtitle', e.target.value)}
                    placeholder="มุ่งมั่นพัฒนาทรัพยากรบุคคล..."
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">วิสัยทัศน์และรายละเอียด (Vision & Details)</label>
                  <textarea
                    rows={5}
                    className="form-textarea text-xs"
                    value={formData.aboutVisionContent || ''}
                    onChange={(e) => handleChange('aboutVisionContent', e.target.value)}
                    placeholder="วิสัยทัศน์ของหน่วยงาน..."
                  />
                </div>
              </div>

              {/* Mission 3 Points */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">พันธกิจ 3 ประการ (Missions)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => {
                    const iconKey = `aboutMission${num}Icon` as keyof SiteFormState;
                    const titleKey = `aboutMission${num}Title` as keyof SiteFormState;
                    const descKey = `aboutMission${num}Desc` as keyof SiteFormState;

                    return (
                      <div key={num} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="font-semibold text-xs text-primary-600 dark:text-primary-400">พันธกิจที่ {num}</div>
                        <input
                          type="text"
                          className="form-input text-xs"
                          value={formData[titleKey] || ''}
                          onChange={(e) => handleChange(titleKey, e.target.value)}
                          placeholder="ชื่อพันธกิจ"
                        />
                        <textarea
                          rows={2}
                          className="form-textarea text-xs"
                          value={formData[descKey] || ''}
                          onChange={(e) => handleChange(descKey, e.target.value)}
                          placeholder="รายละเอียดพันธกิจ"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 'contact' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-map-location-dot text-primary-500"></i>
                  <span>ข้อมูลติดต่อและแผนที่ (Contact Info & Map)</span>
                </h3>
                <Link href="/contact" target="_blank" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  <span>ดูตัวอย่างหน้า /contact</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อหน่วยงาน / องค์กร</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.organizationName || ''}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    placeholder="ศูนย์เทคโนโลยีสารสนเทศ..."
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">เวลาทำการ (Working Hours)</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.contactWorkingHours || ''}
                    onChange={(e) => handleChange('contactWorkingHours', e.target.value)}
                    placeholder="จันทร์ – ศุกร์: 08:30 – 16:30 น."
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ที่อยู่หน่วยงาน (Full Address)</label>
                  <textarea
                    rows={2}
                    className="form-textarea text-xs"
                    value={formData.organizationAddress || ''}
                    onChange={(e) => handleChange('organizationAddress', e.target.value)}
                    placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">เบอร์โทรศัพท์หลัก</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.organizationPhone || ''}
                    onChange={(e) => handleChange('organizationPhone', e.target.value)}
                    placeholder="02-123-4567"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">เบอร์โทรศัพท์สำรอง / ภายใน</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.contactPhoneSecondary || ''}
                    onChange={(e) => handleChange('contactPhoneSecondary', e.target.value)}
                    placeholder="02-123-4568"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">อีเมลติดต่อหลัก (Contact Email)</label>
                  <input
                    type="email"
                    className="form-input text-xs"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="contact@eprofile.local"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">อีเมลฝ่ายบริการสนับสนุน (Support Email)</label>
                  <input
                    type="email"
                    className="form-input text-xs"
                    value={formData.contactEmailSupport || ''}
                    onChange={(e) => handleChange('contactEmailSupport', e.target.value)}
                    placeholder="support@eprofile.local"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Maps Embed URL (iframe src)</label>
                  <input
                    type="text"
                    className="form-input text-xs font-mono"
                    value={formData.contactMapEmbedUrl || ''}
                    onChange={(e) => handleChange('contactMapEmbedUrl', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES */}
          {activeTab === 'services' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-primary-500"></i>
                    <span>รายการงานบริการ (Services & Applications)</span>
                  </h3>
                  <p className="text-xs text-slate-400">จัดการรายการบริการทั้งหมดที่แสดงผลบนหน้าบริการของระบบ</p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon="fa-solid fa-plus"
                  onClick={() => {
                    setEditingService(null);
                    setIsServiceModalOpen(true);
                  }}
                >
                  เพิ่มบริการใหม่
                </Button>
              </div>

              {/* Service Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">
                          <i className={srv.icon || 'fa-solid fa-layer-group'}></i>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            srv.published
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {srv.published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{srv.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {srv.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishService(srv)}
                        className="text-[11px] text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {srv.published ? 'ซ่อน' : 'แสดง'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(srv);
                            setIsServiceModalOpen(true);
                          }}
                          className="p-1 px-2 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingServiceId(srv.id)}
                          className="p-1 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {services.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  ยังไม่มีรายการบริการ กดปุ่ม "เพิ่มบริการใหม่" ด้านบนเพื่อเริ่มสร้าง
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SEO & SOCIAL */}
          {activeTab === 'seo' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass-arrow-right text-primary-500"></i>
                  <span>SEO Metadata & Social Media Links</span>
                </h3>
                <p className="text-xs text-slate-400">ตั้งค่าหัวข้อ คำอธิบายสำหรับการค้นหา (Google) และช่องทางโซเชียลมีเดีย</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Site Title (ชื่อเว็บไซต์ในแท็บเบราว์เซอร์)</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.siteMetaTitle || ''}
                    onChange={(e) => handleChange('siteMetaTitle', e.target.value)}
                    placeholder="eProfile — ระบบบริหารจัดการบุคลากร"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Meta Description (คำอธิบายสำหรับ Search Engine)</label>
                  <textarea
                    rows={3}
                    className="form-textarea text-xs"
                    value={formData.siteMetaDescription || ''}
                    onChange={(e) => handleChange('siteMetaDescription', e.target.value)}
                    placeholder="สรุปหน้าที่และจุดประสงค์ของเว็บไซต์..."
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords (คำค้นหา คั่นด้วยจุลภาค)</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.siteKeywords || ''}
                    onChange={(e) => handleChange('siteKeywords', e.target.value)}
                    placeholder="eprofile, บุคลากร, ข้าราชการ, ระบบการลา"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Facebook Page URL</label>
                  <input
                    type="url"
                    className="form-input text-xs"
                    value={formData.socialFacebook || ''}
                    onChange={(e) => handleChange('socialFacebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">LINE Official Account / ID</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={formData.socialLine || ''}
                    onChange={(e) => handleChange('socialLine', e.target.value)}
                    placeholder="@eprofile"
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">YouTube Channel URL</label>
                  <input
                    type="url"
                    className="form-input text-xs"
                    value={formData.socialYoutube || ''}
                    onChange={(e) => handleChange('socialYoutube', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="form-control">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Twitter / X URL</label>
                  <input
                    type="url"
                    className="form-input text-xs"
                    value={formData.socialTwitter || ''}
                    onChange={(e) => handleChange('socialTwitter', e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon="fa-solid fa-floppy-disk"
              isLoading={isSaving}
              loadingText="กำลังบันทึก..."
            >
              บันทึกการตั้งค่าทั้งหมด
            </Button>
          </div>
        </form>
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <ServiceEditorModal
          service={editingService}
          onClose={() => {
            setIsServiceModalOpen(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingServiceId}
        onClose={() => setDeletingServiceId(null)}
        title="ยืนยันการลบบริการ?"
        icon="fa-solid fa-triangle-exclamation"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeletingServiceId(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deletingServiceId && handleDeleteService(deletingServiceId)}
            >
              ยืนยันการลบ
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-400">
          คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </Modal>
    </div>
  );
}

// ── Sub-component: Service Editor Modal ───────────────────────────────
function ServiceEditorModal({
  service,
  onClose,
  onSave,
}: {
  service: ServiceItem | null;
  onClose: () => void;
  onSave: (data: Partial<ServiceItem>) => void;
}) {
  const [title, setTitle] = useState(service?.title || '');
  const [description, setDescription] = useState(service?.description || '');
  const [icon, setIcon] = useState(service?.icon || 'fa-solid fa-layer-group');
  const [published, setPublished] = useState(service?.published ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('กรุณาระบุชื่อบริการ');
      return;
    }
    onSave({
      title,
      description,
      icon,
      published,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={service ? 'แก้ไขข้อมูลบริการ' : 'เพิ่มบริการใหม่'}
      icon="fa-solid fa-layer-group"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            บันทึก
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อบริการ *</label>
          <input
            type="text"
            className="form-input text-xs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ระบบยื่นคำร้องออนไลน์"
            required
          />
        </div>

        <div className="form-control">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">รายละเอียดบริการ</label>
          <textarea
            rows={3}
            className="form-textarea text-xs"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="รายละเอียดหรือขั้นตอนการใช้บริการ..."
          />
        </div>

        <div className="form-control">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ไอคอน (FontAwesome Class)</label>
          <input
            type="text"
            className="form-input text-xs font-mono"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="fa-solid fa-layer-group"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="srv-pub"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="srv-pub" className="text-xs text-slate-700 dark:text-slate-300">
            เผยแพร่ทันที (Published)
          </label>
        </div>
      </form>
    </Modal>
  );
}
