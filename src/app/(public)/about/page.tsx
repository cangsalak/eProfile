import React from 'react';

export const metadata = {
  title: 'เกี่ยวกับเรา - eProfile',
  description: 'ข้อมูลและประวัติความเป็นมาขององค์กร',
};

export default function AboutPage() {
  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">เกี่ยวกับองค์กร</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">มุ่งมั่นพัฒนาทรัพยากรบุคคล ด้วยเทคโนโลยีที่ทันสมัย</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center">
            <i className="fa-solid fa-building text-6xl text-slate-400 dark:text-slate-600"></i>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">วิสัยทัศน์ของเรา (Vision)</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            เรามุ่งมั่นที่จะเป็นผู้นำในการให้บริการและพัฒนาทรัพยากรบุคคล ด้วยการนำเทคโนโลยีสมัยใหม่มาประยุกต์ใช้ เพื่อสร้างสภาพแวดล้อมการทำงานที่ดีและมีประสิทธิภาพสูงสุดให้กับบุคลากรทุกคนในองค์กร
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            ระบบ eProfile ถูกออกแบบมาเพื่อตอบโจทย์การทำงานในยุคดิจิทัล ลดขั้นตอนที่ซับซ้อน และเพิ่มความรวดเร็วในการเข้าถึงข้อมูล
          </p>
        </div>
      </div>
      
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">พันธกิจ (Mission)</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">รวดเร็ว</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">บริการที่ตอบสนองความต้องการอย่างทันท่วงที</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">ปลอดภัย</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">ปกป้องข้อมูลส่วนบุคคลด้วยมาตรฐานความปลอดภัยสูงสุด</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">โปร่งใส</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">กระบวนการทำงานที่ตรวจสอบได้ในทุกขั้นตอน</p>
          </div>
        </div>
      </div>
    </div>
  );
}
