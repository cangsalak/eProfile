'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PublicContactView() {
  const [settings, setSettings] = useState<any>({
    organizationName: 'กองบัญชาการ / หน่วยงานต้นสังกัด',
    organizationAddress: 'ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
    organizationPhone: '02-123-4567',
    contactPhoneSecondary: '02-123-4568 (ฝ่ายบริการ/สอบถาม)',
    contactEmail: 'contact@eprofile.com',
    contactEmailSupport: 'support@eprofile.com',
    contactMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth',
    contactMapLink: 'https://maps.google.com/?q=Government+Complex+Chaeng+Watthana'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error fetching settings for contact page:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('ไม่สามารถส่งข้อความได้');
      
      toast.success('ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanPhone1 = (settings.organizationPhone || '').replace(/[^\d+]/g, '');
  const cleanPhone2 = (settings.contactPhoneSecondary || '').replace(/[^\d+]/g, '');

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-prompt">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">ติดต่อเรา</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          มีข้อสงสัยหรือต้องการความช่วยเหลือ? ติดต่อทีมงาน {settings.organizationName || 'eProfile'} ได้ทันที
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">ข้อมูลการติดต่อ</h2>
          
          <div className="space-y-8">
            {/* Office Address */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">ที่อยู่สำนักงาน</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {settings.organizationAddress || 'ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210'}
                </p>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">เบอร์โทรศัพท์</h3>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-1">
                  {settings.organizationPhone && (
                    <a 
                      href={`tel:${cleanPhone1 || settings.organizationPhone}`} 
                      className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{settings.organizationPhone}</span>
                    </a>
                  )}
                  {settings.contactPhoneSecondary && (
                    <a 
                      href={`tel:${cleanPhone2 || settings.contactPhoneSecondary}`} 
                      className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{settings.contactPhoneSecondary}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Emails */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">อีเมล</h3>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed flex flex-col gap-1">
                  {settings.contactEmail && (
                    <a 
                      href={`mailto:${settings.contactEmail}`} 
                      className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors"
                    >
                      {settings.contactEmail}
                    </a>
                  )}
                  {settings.contactEmailSupport && (
                    <a 
                      href={`mailto:${settings.contactEmailSupport}`} 
                      className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors"
                    >
                      {settings.contactEmailSupport}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Google Map Display */}
          <div className="mt-10 rounded-3xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md relative group">
            <iframe 
              src={settings.contactMapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth'} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              allow="fullscreen"
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="ที่ตั้งสำนักงาน Google Map"
            ></iframe>
            {settings.contactMapLink && (
              <a
                href={settings.contactMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-xs hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                <span>เปิดใน Google Maps</span>
              </a>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">ส่งข้อความถึงเรา</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-name"
                aria-label="ชื่อ-นามสกุลผู้ติดต่อ"
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-email"
                  aria-label="อีเมลสำหรับติดต่อกลับ"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors"
                  placeholder="example@mail.com"
                />
              </div>
              
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="contact-phone"
                  aria-label="เบอร์โทรศัพท์สำหรับติดต่อ"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ข้อความ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-message"
                aria-label="รายละเอียดข้อความหรือเรื่องที่ต้องการติดต่อ"
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors resize-none"
                placeholder="ระบุข้อความหรือเรื่องที่ต้องการติดต่อ..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> กำลังส่งข้อความ...</>
              ) : (
                <><i className="fa-solid fa-paper-plane mr-2"></i> ส่งข้อความ</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
