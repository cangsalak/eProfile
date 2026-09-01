'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">ติดต่อเรา</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">มีข้อสงสัยหรือต้องการความช่วยเหลือ? ติดต่อทีมงาน eProfile ได้ทันที</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">ข้อมูลการติดต่อ</h2>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">ที่อยู่สำนักงาน</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B<br />
                  ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง<br />
                  เขตหลักสี่ กรุงเทพมหานคร 10210
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">เบอร์โทรศัพท์</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  02-123-4567<br />
                  02-123-4568 (ฝ่ายขาย)
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">อีเมล</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  contact@eprofile.com<br />
                  support@eprofile.com
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl overflow-hidden aspect-video bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {/* Embedded Google Map Placeholder */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">ส่งข้อความถึงเรา</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors"
                  placeholder="example@mail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-colors"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ข้อความ <span className="text-red-500">*</span>
              </label>
              <textarea
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
