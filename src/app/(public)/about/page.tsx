import React from 'react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'เกี่ยวกับเรา - eProfile',
  description: 'ข้อมูลและประวัติความเป็นมาขององค์กร',
};

export default async function AboutPage() {
  const settingsList = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          'aboutTitle',
          'aboutSubtitle',
          'aboutVisionTitle',
          'aboutVisionContent',
          'aboutImage',
          'aboutMissionTitle',
          'aboutMission1Icon',
          'aboutMission1Title',
          'aboutMission1Desc',
          'aboutMission2Icon',
          'aboutMission2Title',
          'aboutMission2Desc',
          'aboutMission3Icon',
          'aboutMission3Title',
          'aboutMission3Desc',
        ],
      },
    },
  }).catch(() => []);

  const s: Record<string, string> = {};
  settingsList.forEach(({ key, value }) => {
    s[key] = value;
  });

  const aboutTitle = s.aboutTitle || 'เกี่ยวกับองค์กร';
  const aboutSubtitle = s.aboutSubtitle || 'มุ่งมั่นพัฒนาทรัพยากรบุคคล ด้วยเทคโนโลยีที่ทันสมัย';
  const visionTitle = s.aboutVisionTitle || 'วิสัยทัศน์ของเรา (Vision)';
  const visionContent = s.aboutVisionContent || 'เรามุ่งมั่นที่จะเป็นผู้นำในการให้บริการและพัฒนาทรัพยากรบุคคล ด้วยการนำเทคโนโลยีสมัยใหม่มาประยุกต์ใช้ เพื่อสร้างสภาพแวดล้อมการทำงานที่ดีและมีประสิทธิภาพสูงสุดให้กับบุคลากรทุกคนในองค์กร\n\nระบบ eProfile ถูกออกแบบมาเพื่อตอบโจทย์การทำงานในยุคดิจิทัล ลดขั้นตอนที่ซับซ้อน และเพิ่มความรวดเร็วในการเข้าถึงข้อมูล';
  const aboutImage = s.aboutImage || '';

  const missionTitle = s.aboutMissionTitle || 'พันธกิจ (Mission)';
  const m1Icon = s.aboutMission1Icon || 'fa-solid fa-bolt';
  const m1Title = s.aboutMission1Title || 'รวดเร็ว';
  const m1Desc = s.aboutMission1Desc || 'บริการที่ตอบสนองความต้องการอย่างทันท่วงที';

  const m2Icon = s.aboutMission2Icon || 'fa-solid fa-shield-halved';
  const m2Title = s.aboutMission2Title || 'ปลอดภัย';
  const m2Desc = s.aboutMission2Desc || 'ปกป้องข้อมูลส่วนบุคคลด้วยมาตรฐานความปลอดภัยสูงสุด';

  const m3Icon = s.aboutMission3Icon || 'fa-solid fa-handshake';
  const m3Title = s.aboutMission3Title || 'โปร่งใส';
  const m3Desc = s.aboutMission3Desc || 'กระบวนการทำงานที่ตรวจสอบได้ในทุกขั้นตอน';

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-prompt">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{aboutTitle}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">{aboutSubtitle}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center">
            {aboutImage ? (
              <img src={aboutImage} alt="Organization" className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-building text-6xl text-slate-400 dark:text-slate-600"></i>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{visionTitle}</h2>
          <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line space-y-4">
            {visionContent}
          </div>
        </div>
      </div>
      
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">{missionTitle}</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className={m1Icon}></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">{m1Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{m1Desc}</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className={m2Icon}></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">{m2Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{m2Desc}</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className={m3Icon}></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">{m3Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{m3Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
