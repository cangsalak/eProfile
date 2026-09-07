'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

interface SiteContentFormState {
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

  // Services Page
  servicesTitle?: string;
  servicesSubtitle?: string;
}

const DEFAULT_CONTENT: SiteContentFormState = {
  homeBadgeText: 'ระบบจัดการบุคลากรรุ่นใหม่',
  homeTitleLine1: 'ยกระดับการบริหาร',
  homeTitleLine2: 'ทรัพยากรบุคคล',
  homeSubtitle: 'แพลตฟอร์มที่รวมทุกฟีเจอร์ที่คุณต้องการ สำหรับการบริหารจัดการบุคลากร การลา ยานพาหนะ และการสื่อสารภายในองค์กร',
  homeCtaPrimaryText: 'เริ่มต้นใช้งานฟรี',
  homeCtaSecondaryText: 'เข้าสู่ระบบสมาชิก',
  homeFeaturesTitle: 'จุดเด่นของระบบ eProfile',
  homeFeaturesSubtitle: 'ครบจบในที่เดียว ด้วยโมดูลที่ออกแบบมาเพื่อลดเวลาทำงานของฝ่าย HR และเพิ่มความสะดวกสบายให้กับบุคลากร',
  homeFeature1Icon: 'fa-solid fa-users',
  homeFeature1Title: 'จัดการข้อมูลบุคลากร',
  homeFeature1Desc: 'จัดเก็บข้อมูลประวัติอย่างเป็นระบบ ค้นหาง่าย สร้างบัตรประจำตัวพนักงานได้ทันที',
  homeFeature2Icon: 'fa-solid fa-calendar-check',
  homeFeature2Title: 'ระบบการลาออนไลน์',
  homeFeature2Desc: 'ยื่นใบลาและอนุมัติผ่านระบบได้ทุกที่ พร้อมพิมพ์ใบลาตามแบบฟอร์มราชการ',
  homeFeature3Icon: 'fa-solid fa-shield-halved',
  homeFeature3Title: 'ความปลอดภัยระดับสูง',
  homeFeature3Desc: 'เข้ารหัสข้อมูลตามมาตรฐานความปลอดภัย พร้อมระบบกำหนดสิทธิ์การเข้าถึงแบบละเอียด',

  aboutTitle: 'เกี่ยวกับองค์กร',
  aboutSubtitle: 'มุ่งมั่นพัฒนาทรัพยากรบุคคล ด้วยเทคโนโลยีที่ทันสมัย',
  aboutVisionTitle: 'วิสัยทัศน์ของเรา (Vision)',
  aboutVisionContent: 'เรามุ่งมั่นที่จะเป็นผู้นำในการให้บริการและพัฒนาทรัพยากรบุคคล ด้วยการนำเทคโนโลยีสมัยใหม่มาประยุกต์ใช้ เพื่อสร้างสภาพแวดล้อมการทำงานที่ดีและมีประสิทธิภาพสูงสุดให้กับบุคลากรทุกคนในองค์กร\n\nระบบ eProfile ถูกออกแบบมาเพื่อตอบโจทย์การทำงานในยุคดิจิทัล ลดขั้นตอนที่ซับซ้อน และเพิ่มความรวดเร็วในการเข้าถึงข้อมูล',
  aboutImage: '',
  aboutMissionTitle: 'พันธกิจ (Mission)',
  aboutMission1Icon: 'fa-solid fa-bolt',
  aboutMission1Title: 'รวดเร็ว',
  aboutMission1Desc: 'บริการที่ตอบสนองความต้องการอย่างทันท่วงที',
  aboutMission2Icon: 'fa-solid fa-shield-halved',
  aboutMission2Title: 'ปลอดภัย',
  aboutMission2Desc: 'ปกป้องข้อมูลส่วนบุคคลด้วยมาตรฐานความปลอดภัยสูงสุด',
  aboutMission3Icon: 'fa-solid fa-handshake',
  aboutMission3Title: 'โปร่งใส',
  aboutMission3Desc: 'กระบวนการทำงานที่ตรวจสอบได้ในทุกขั้นตอน',

  contactTitle: 'ติดต่อเรา',
  contactSubtitle: 'มีข้อสงสัยหรือต้องการความช่วยเหลือ? ติดต่อทีมงานได้ทันที',
  organizationName: 'กองบัญชาการ / หน่วยงานต้นสังกัด',
  organizationAddress: 'ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
  organizationPhone: '02-123-4567',
  contactPhoneSecondary: '02-123-4568 (ฝ่ายบริการ/สอบถาม)',
  contactEmail: 'contact@eprofile.com',
  contactEmailSupport: 'support@eprofile.com',
  contactWorkingHours: 'จันทร์ - ศุกร์: 08:30 - 16:30 น. (เว้นวันหยุดราชการ)',
  contactMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth',
  contactMapLink: 'https://maps.google.com/?q=Government+Complex+Chaeng+Watthana',

  servicesTitle: 'บริการของเรา',
  servicesSubtitle: 'เลือกบริการที่เหมาะสมกับองค์กรของคุณ',
};

export default function SiteContentView() {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'contact' | 'services'>('home');
  const [formData, setFormData] = useState<SiteContentFormState>(DEFAULT_CONTENT);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchServices();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (error) {
      console.error('Error loading site content:', error);
      toast.error('ไม่สามารถโหลดข้อมูลเนื้อหาเว็บไซต์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services?all=true');
      if (res.ok) {
        const json = await res.json();
        setServicesList(json.data || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetTab = (tab: 'home' | 'about' | 'contact' | 'services') => {
    if (!confirm(`คุณต้องการคืนค่าเริ่มต้นสำหรับแท็บ "${tab === 'home' ? 'หน้าแรก' : tab === 'about' ? 'เกี่ยวกับเรา' : tab === 'contact' ? 'ติดต่อเรา' : 'บริการ'}" ใช่หรือไม่?`)) {
      return;
    }

    if (tab === 'home') {
      setFormData((prev) => ({
        ...prev,
        homeBadgeText: DEFAULT_CONTENT.homeBadgeText,
        homeTitleLine1: DEFAULT_CONTENT.homeTitleLine1,
        homeTitleLine2: DEFAULT_CONTENT.homeTitleLine2,
        homeSubtitle: DEFAULT_CONTENT.homeSubtitle,
        homeCtaPrimaryText: DEFAULT_CONTENT.homeCtaPrimaryText,
        homeCtaSecondaryText: DEFAULT_CONTENT.homeCtaSecondaryText,
        homeFeaturesTitle: DEFAULT_CONTENT.homeFeaturesTitle,
        homeFeaturesSubtitle: DEFAULT_CONTENT.homeFeaturesSubtitle,
        homeFeature1Icon: DEFAULT_CONTENT.homeFeature1Icon,
        homeFeature1Title: DEFAULT_CONTENT.homeFeature1Title,
        homeFeature1Desc: DEFAULT_CONTENT.homeFeature1Desc,
        homeFeature2Icon: DEFAULT_CONTENT.homeFeature2Icon,
        homeFeature2Title: DEFAULT_CONTENT.homeFeature2Title,
        homeFeature2Desc: DEFAULT_CONTENT.homeFeature2Desc,
        homeFeature3Icon: DEFAULT_CONTENT.homeFeature3Icon,
        homeFeature3Title: DEFAULT_CONTENT.homeFeature3Title,
        homeFeature3Desc: DEFAULT_CONTENT.homeFeature3Desc,
      }));
    } else if (tab === 'about') {
      setFormData((prev) => ({
        ...prev,
        aboutTitle: DEFAULT_CONTENT.aboutTitle,
        aboutSubtitle: DEFAULT_CONTENT.aboutSubtitle,
        aboutVisionTitle: DEFAULT_CONTENT.aboutVisionTitle,
        aboutVisionContent: DEFAULT_CONTENT.aboutVisionContent,
        aboutImage: DEFAULT_CONTENT.aboutImage,
        aboutMissionTitle: DEFAULT_CONTENT.aboutMissionTitle,
        aboutMission1Icon: DEFAULT_CONTENT.aboutMission1Icon,
        aboutMission1Title: DEFAULT_CONTENT.aboutMission1Title,
        aboutMission1Desc: DEFAULT_CONTENT.aboutMission1Desc,
        aboutMission2Icon: DEFAULT_CONTENT.aboutMission2Icon,
        aboutMission2Title: DEFAULT_CONTENT.aboutMission2Title,
        aboutMission2Desc: DEFAULT_CONTENT.aboutMission2Desc,
        aboutMission3Icon: DEFAULT_CONTENT.aboutMission3Icon,
        aboutMission3Title: DEFAULT_CONTENT.aboutMission3Title,
        aboutMission3Desc: DEFAULT_CONTENT.aboutMission3Desc,
      }));
    } else if (tab === 'contact') {
      setFormData((prev) => ({
        ...prev,
        contactTitle: DEFAULT_CONTENT.contactTitle,
        contactSubtitle: DEFAULT_CONTENT.contactSubtitle,
        organizationName: DEFAULT_CONTENT.organizationName,
        organizationAddress: DEFAULT_CONTENT.organizationAddress,
        organizationPhone: DEFAULT_CONTENT.organizationPhone,
        contactPhoneSecondary: DEFAULT_CONTENT.contactPhoneSecondary,
        contactEmail: DEFAULT_CONTENT.contactEmail,
        contactEmailSupport: DEFAULT_CONTENT.contactEmailSupport,
        contactWorkingHours: DEFAULT_CONTENT.contactWorkingHours,
        contactMapEmbedUrl: DEFAULT_CONTENT.contactMapEmbedUrl,
        contactMapLink: DEFAULT_CONTENT.contactMapLink,
      }));
    } else if (tab === 'services') {
      setFormData((prev) => ({
        ...prev,
        servicesTitle: DEFAULT_CONTENT.servicesTitle,
        servicesSubtitle: DEFAULT_CONTENT.servicesSubtitle,
      }));
    }
    toast.success('คืนค่าเริ่มต้นเรียบร้อยแล้ว (อย่าลืมกดบันทึก)');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      toast.success('บันทึกการตั้งค่าเนื้อหาเว็บไซต์เรียบร้อยแล้ว');
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Services CRUD Handlers ─────────────────────────────────────
  const handleOpenAddService = () => {
    setEditingService({
      title: '',
      description: '',
      price: '',
      image: '',
      icon: 'fa-layer-group',
      published: true,
      order: servicesList.length,
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService({ ...service });
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!confirm(`คุณแน่ใจว่าต้องการลบบริการ "${title}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ไม่สามารถลบบริการได้');
      toast.success('ลบบริการเรียบร้อยแล้ว');
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleTogglePublishService = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !service.published }),
      });
      if (!res.ok) throw new Error('ไม่สามารถอัปเดตสถานะได้');
      toast.success(`${service.published ? 'ซ่อน' : 'แสดง'}บริการเรียบร้อยแล้ว`);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveServiceModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.description) {
      toast.error('กรุณากรอกชื่อและรายละเอียดบริการ');
      return;
    }

    setIsSavingService(true);
    try {
      const isEdit = !!editingService.id;
      const url = isEdit ? `/api/services/${editingService.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }

      toast.success(isEdit ? 'อัปเดตบริการเรียบร้อยแล้ว' : 'เพิ่มบริการใหม่เรียบร้อยแล้ว');
      setIsServiceModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingService(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-prompt">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลเนื้อหาเว็บไซต์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-prompt">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
              <i className="fa-solid fa-window-maximize" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการเนื้อหาหน้าเว็บ</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ปรับแต่งข้อความ หัวข้อ และองค์ประกอบต่างๆ ของหน้าแรก เกี่ยวกับเรา ติดต่อเรา และบริการ
          </p>
        </div>

        {/* Quick links to live pages */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            <span>หน้าแรก</span>
          </Link>
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            <span>เกี่ยวกับเรา</span>
          </Link>
          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            <span>บริการ</span>
          </Link>
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            <span>ติดต่อเรา</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === 'home'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <i className="fa-solid fa-house" />
          <span>หน้าแรก (Home)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === 'about'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <i className="fa-solid fa-building" />
          <span>เกี่ยวกับเรา (About)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === 'services'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <i className="fa-solid fa-layer-group" />
          <span>บริการ (Services)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
            activeTab === 'contact'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <i className="fa-solid fa-phone" />
          <span>ติดต่อเรา (Contact)</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ============================================================ */}
        {/* 1. HOME TAB */}
        {/* ============================================================ */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Section Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-wand-magic-sparkles" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ส่วนหัวหน้าแรก (Hero Section)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetTab('home')}
                  className="text-xs text-slate-500 hover:text-rose-500 transition"
                >
                  <i className="fa-solid fa-rotate-left mr-1" /> คืนค่าเริ่มต้น
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ข้อความ Badge ด้านบน
                  </label>
                  <input
                    type="text"
                    name="homeBadgeText"
                    value={formData.homeBadgeText || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น ระบบจัดการบุคลากรรุ่นใหม่"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหลัก บรรทัดที่ 1
                  </label>
                  <input
                    type="text"
                    name="homeTitleLine1"
                    value={formData.homeTitleLine1 || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น ยกระดับการบริหาร"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหลัก บรรทัดที่ 2 (เน้นสี Gradient)
                  </label>
                  <input
                    type="text"
                    name="homeTitleLine2"
                    value={formData.homeTitleLine2 || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น ทรัพยากรบุคคล"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำอธิบาย / คำโปรยใต้หัวข้อ
                  </label>
                  <textarea
                    name="homeSubtitle"
                    rows={3}
                    value={formData.homeSubtitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="คำบรรยายสั้นๆ เกี่ยวกับระบบ..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ข้อความปุ่มเริ่มต้นใช้งาน (Primary CTA)
                  </label>
                  <input
                    type="text"
                    name="homeCtaPrimaryText"
                    value={formData.homeCtaPrimaryText || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น เริ่มต้นใช้งานฟรี"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ข้อความปุ่มเข้าสู่ระบบ (Secondary CTA)
                  </label>
                  <input
                    type="text"
                    name="homeCtaSecondaryText"
                    value={formData.homeCtaSecondaryText || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น เข้าสู่ระบบสมาชิก"
                  />
                </div>
              </div>
            </div>

            {/* Features Section Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-cubes" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">การ์ดจุดเด่นของระบบ (Features)</h3>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหมวดจุดเด่น
                  </label>
                  <input
                    type="text"
                    name="homeFeaturesTitle"
                    value={formData.homeFeaturesTitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น จุดเด่นของระบบ eProfile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำบรรยายใต้หัวข้อหมวดจุดเด่น
                  </label>
                  <input
                    type="text"
                    name="homeFeaturesSubtitle"
                    value={formData.homeFeaturesSubtitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="คำอธิบายสรุปความสามารถของระบบ..."
                  />
                </div>
              </div>

              {/* 3 Feature Cards */}
              <div className="grid gap-4 md:grid-cols-3 pt-2">
                {/* Feature 1 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">1</span>
                    <span>จุดเด่นที่ 1</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="homeFeature1Icon"
                      value={formData.homeFeature1Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-users"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อจุดเด่น</label>
                    <input
                      type="text"
                      name="homeFeature1Title"
                      value={formData.homeFeature1Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="ชื่อหัวข้อ"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="homeFeature1Desc"
                      rows={2}
                      value={formData.homeFeature1Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">2</span>
                    <span>จุดเด่นที่ 2</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="homeFeature2Icon"
                      value={formData.homeFeature2Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-calendar-check"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อจุดเด่น</label>
                    <input
                      type="text"
                      name="homeFeature2Title"
                      value={formData.homeFeature2Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="ชื่อหัวข้อ"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="homeFeature2Desc"
                      rows={2}
                      value={formData.homeFeature2Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">3</span>
                    <span>จุดเด่นที่ 3</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="homeFeature3Icon"
                      value={formData.homeFeature3Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-shield-halved"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อจุดเด่น</label>
                    <input
                      type="text"
                      name="homeFeature3Title"
                      value={formData.homeFeature3Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="ชื่อหัวข้อ"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="homeFeature3Desc"
                      rows={2}
                      value={formData.homeFeature3Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ABOUT TAB */}
        {/* ============================================================ */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Header & Vision Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-eye" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ข้อมูลทั่วไป & วิสัยทัศน์ (Vision)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetTab('about')}
                  className="text-xs text-slate-500 hover:text-rose-500 transition"
                >
                  <i className="fa-solid fa-rotate-left mr-1" /> คืนค่าเริ่มต้น
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหน้าเกี่ยวกับเรา
                  </label>
                  <input
                    type="text"
                    name="aboutTitle"
                    value={formData.aboutTitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น เกี่ยวกับองค์กร"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำโปรยใต้หัวข้อ
                  </label>
                  <input
                    type="text"
                    name="aboutSubtitle"
                    value={formData.aboutSubtitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น มุ่งมั่นพัฒนาทรัพยากรบุคคล..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อส่วนวิสัยทัศน์
                  </label>
                  <input
                    type="text"
                    name="aboutVisionTitle"
                    value={formData.aboutVisionTitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น วิสัยทัศน์ของเรา (Vision)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL รูปภาพองค์กร / อาคาร (เว้นว่างไว้จะใช้ Icon อาคาร)
                  </label>
                  <input
                    type="text"
                    name="aboutImage"
                    value={formData.aboutImage || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="https://... หรือ /images/building.jpg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เนื้อหาวิสัยทัศน์ (รองรับการขึ้นบรรทัดใหม่)
                  </label>
                  <textarea
                    name="aboutVisionContent"
                    rows={5}
                    value={formData.aboutVisionContent || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="บรรยายวิสัยทัศน์และเป้าหมายขององค์กร..."
                  />
                </div>
              </div>
            </div>

            {/* Mission Section Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-bullseye" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">พันธกิจ (Mission Cards)</h3>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อหมวดพันธกิจ
                </label>
                <input
                  type="text"
                  name="aboutMissionTitle"
                  value={formData.aboutMissionTitle || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="เช่น พันธกิจ (Mission)"
                />
              </div>

              {/* 3 Mission Cards */}
              <div className="grid gap-4 md:grid-cols-3 pt-2">
                {/* Mission 1 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">1</span>
                    <span>พันธกิจที่ 1</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="aboutMission1Icon"
                      value={formData.aboutMission1Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-bolt"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อพันธกิจ</label>
                    <input
                      type="text"
                      name="aboutMission1Title"
                      value={formData.aboutMission1Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น รวดเร็ว"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="aboutMission1Desc"
                      rows={2}
                      value={formData.aboutMission1Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>

                {/* Mission 2 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">2</span>
                    <span>พันธกิจที่ 2</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="aboutMission2Icon"
                      value={formData.aboutMission2Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-shield-halved"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อพันธกิจ</label>
                    <input
                      type="text"
                      name="aboutMission2Title"
                      value={formData.aboutMission2Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น ปลอดภัย"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="aboutMission2Desc"
                      rows={2}
                      value={formData.aboutMission2Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>

                {/* Mission 3 */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary-600 dark:text-primary-400">
                    <span className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[10px]">3</span>
                    <span>พันธกิจที่ 3</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      name="aboutMission3Icon"
                      value={formData.aboutMission3Icon || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น fa-solid fa-handshake"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ชื่อพันธกิจ</label>
                    <input
                      type="text"
                      name="aboutMission3Title"
                      value={formData.aboutMission3Title || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="เช่น โปร่งใส"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">คำอธิบาย</label>
                    <textarea
                      name="aboutMission3Desc"
                      rows={2}
                      value={formData.aboutMission3Desc || ''}
                      onChange={handleChange}
                      className="form-control text-xs"
                      placeholder="คำอธิบาย..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. SERVICES TAB */}
        {/* ============================================================ */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Header Settings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-layer-group" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">หัวข้อหน้าบริการ (Services Header)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetTab('services')}
                  className="text-xs text-slate-500 hover:text-rose-500 transition"
                >
                  <i className="fa-solid fa-rotate-left mr-1" /> คืนค่าเริ่มต้น
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหน้าบริการ
                  </label>
                  <input
                    type="text"
                    name="servicesTitle"
                    value={formData.servicesTitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น บริการของเรา"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำโปรยใต้หัวข้อ
                  </label>
                  <input
                    type="text"
                    name="servicesSubtitle"
                    value={formData.servicesSubtitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น เลือกบริการที่เหมาะสมกับองค์กรของคุณ"
                  />
                </div>
              </div>
            </div>

            {/* Service Items Management */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">รายการบริการทั้งหมด ({servicesList.length})</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">เพิ่ม แก้ไข ลบ หรือเปิด/ปิดการแสดงผลบริการในหน้าสาธารณะ</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <i className="fa-solid fa-plus" />
                  <span>เพิ่มบริการใหม่</span>
                </button>
              </div>

              {servicesList.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <i className="fa-solid fa-box-open text-3xl text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">ยังไม่มีรายการบริการในระบบ</p>
                  <button
                    type="button"
                    onClick={handleOpenAddService}
                    className="mt-3 text-xs font-semibold text-primary-600 hover:underline"
                  >
                    + เพิ่มบริการแรก
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {servicesList.map((srv) => (
                    <div
                      key={srv.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between transition ${
                        srv.published
                          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                          : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg shrink-0">
                              <i className={`fa-solid ${srv.icon || 'fa-layer-group'}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{srv.title}</h4>
                              {srv.price ? (
                                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{srv.price}</span>
                              ) : (
                                <span className="text-xs text-slate-400">ไม่ระบุราคา</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              srv.published
                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {srv.published ? 'แสดงผล' : 'ซ่อน'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublishService(srv)}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                          title={srv.published ? 'ซ่อนจากหน้าเว็บ' : 'เปิดแสดงผล'}
                        >
                          <i className={`fa-solid ${srv.published ? 'fa-eye-slash' : 'fa-eye'} mr-1`} />
                          <span>{srv.published ? 'ซ่อน' : 'แสดง'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditService(srv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="แก้ไข"
                          >
                            <i className="fa-solid fa-pen text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id, srv.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="ลบ"
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. CONTACT TAB */}
        {/* ============================================================ */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs">
                    <i className="fa-solid fa-address-card" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">ข้อมูลติดต่อ & สถานที่ตั้ง</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetTab('contact')}
                  className="text-xs text-slate-500 hover:text-rose-500 transition"
                >
                  <i className="fa-solid fa-rotate-left mr-1" /> คืนค่าเริ่มต้น
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    หัวข้อหน้าติดต่อเรา
                  </label>
                  <input
                    type="text"
                    name="contactTitle"
                    value={formData.contactTitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น ติดต่อเรา"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    คำโปรยใต้หัวข้อ
                  </label>
                  <input
                    type="text"
                    name="contactSubtitle"
                    value={formData.contactSubtitle || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น มีข้อสงสัยหรือต้องการความช่วยเหลือ? ติดต่อทีมงานได้ทันที"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อองค์กร / หน่วยงานต้นสังกัด
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น กองบัญชาการ..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ที่อยู่สำนักงาน
                  </label>
                  <textarea
                    name="organizationAddress"
                    rows={3}
                    value={formData.organizationAddress || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="บ้านเลขที่ อาคาร ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เบอร์โทรศัพท์หลัก
                  </label>
                  <input
                    type="text"
                    name="organizationPhone"
                    value={formData.organizationPhone || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น 02-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เบอร์โทรศัพท์รอง / แผนก
                  </label>
                  <input
                    type="text"
                    name="contactPhoneSecondary"
                    value={formData.contactPhoneSecondary || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น 02-123-4568 (ฝ่ายบริการ)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมลติดต่อหลัก
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="contact@organization.go.th"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมลฝ่ายสนับสนุน / Helpdesk
                  </label>
                  <input
                    type="email"
                    name="contactEmailSupport"
                    value={formData.contactEmailSupport || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="support@organization.go.th"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    วันและเวลาทำการ
                  </label>
                  <input
                    type="text"
                    name="contactWorkingHours"
                    value={formData.contactWorkingHours || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="เช่น จันทร์ - ศุกร์: 08:30 - 16:30 น. (เว้นวันหยุดราชการ)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Maps Embed URL (สำหรับแสดงแผนที่ในหน้าเว็บ)
                  </label>
                  <input
                    type="text"
                    name="contactMapEmbedUrl"
                    value={formData.contactMapEmbedUrl || ''}
                    onChange={handleChange}
                    className="form-control font-mono text-xs"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Maps Direct Link (สำหรับปุ่มกดเปิด Google Maps App)
                  </label>
                  <input
                    type="text"
                    name="contactMapLink"
                    value={formData.contactMapLink || ''}
                    onChange={handleChange}
                    className="form-control font-mono text-xs"
                    placeholder="https://maps.google.com/?q=..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <i className="fa-solid fa-circle-info mr-1.5 text-primary-500" />
            การแก้ไขจะมีผลทันทีต่อหน้าเว็บหลัก (Guest / Public Pages)
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-primary-600/20 transition"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ============================================================ */}
      {/* SERVICE MODAL (Add / Edit) */}
      {/* ============================================================ */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-primary-500" />
                <span>{editingService.id ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setEditingService(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อบริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="form-control text-sm"
                  placeholder="เช่น บริการออกบัตรประจำตัวด่วน"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รายละเอียดบริการ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="form-control text-sm"
                  placeholder="อธิบายรายละเอียดขอบเขตการให้บริการ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ราคา / ค่าธรรมเนียม
                  </label>
                  <input
                    type="text"
                    value={editingService.price || ''}
                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    className="form-control text-sm"
                    placeholder="เช่น ฟรี หรือ 500 บาท"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    FontAwesome Icon Class
                  </label>
                  <input
                    type="text"
                    value={editingService.icon || 'fa-layer-group'}
                    onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                    className="form-control text-sm"
                    placeholder="เช่น fa-id-card"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL ภาพประกอบ (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={editingService.image || ''}
                  onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                  className="form-control text-sm"
                  placeholder="https://... หรือ /images/service1.jpg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="service-published"
                  checked={editingService.published ?? true}
                  onChange={(e) => setEditingService({ ...editingService, published: e.target.checked })}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="service-published" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  เปิดแสดงผลในหน้าสาธารณะทันที
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsServiceModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
                >
                  {isSavingService ? 'กำลังบันทึก...' : editingService.id ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
