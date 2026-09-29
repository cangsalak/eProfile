'use client';

import React, { useEffect, useState } from 'react';
import BadgeCanvasEditor from '../components/BadgeCanvasEditor';
import { Badge, Button, Input } from '@/components/ui';

interface BadgeDesignSettingsProps {
  settings: any;
  setSettings: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  previewSide?: 'front' | 'back';
  setPreviewSide?: (side: 'front' | 'back') => void;
}

export default function BadgeDesignSettings({
  settings,
  setSettings,
  handleChange,
}: BadgeDesignSettingsProps) {
  const [showOrgSettings, setShowOrgSettings] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(console.error);
  }, []);

  // Automatically enforce canvas as the sole unified template format
  useEffect(() => {
    if (settings && settings.badgeTemplate !== 'canvas') {
      setSettings((prev: any) => ({ ...prev, badgeTemplate: 'canvas' }));
    }
  }, [settings, setSettings]);

  const parseConfig = (val: any) => {
    if (!val) return undefined;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  };

  const colorMode = settings.badgeColorMode || 'auto';
  const colorCommissioned = settings.colorCommissioned || '#dc2626';
  const colorNonCommissioned = settings.colorNonCommissioned || '#d97706';
  const colorConscript = settings.colorConscript || '#16a34a';
  const badgeCustomColor = settings.badgeCustomColor || '#4f46e5';

  const handleRankColorDirectUpdate = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      {/* Studio Header & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-pen-ruler text-primary-500" />
              <span>สตูดิโอออกแบบบัตรประจำตัว (Canvas Studio)</span>
            </h3>
            <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
              Canvas Only
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ออกแบบและจัดวางองค์ประกอบบัตรประจำตัวข้าราชการ CR80 อิสระ รองรับการแยกสีตามชั้นยศอัตโนมัติ
          </p>
        </div>

        {/* Collapsible toggle for Organization/Back Side */}
        <button
          type="button"
          onClick={() => setShowOrgSettings(!showOrgSettings)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <i className={`fa-solid ${showOrgSettings ? 'fa-chevron-up' : 'fa-building'} text-xs text-slate-400`} />
          <span>{showOrgSettings ? 'ซ่อนข้อมูลองค์กร/หลังบัตร' : 'ตั้งค่าข้อมูลองค์กร/หลังบัตร'}</span>
        </button>
      </div>

      {/* ─── SECTION 1: ตัวเลือกแยกสีตามชั้นยศ (RANK-BASED COLOR SCHEME) ───────── */}
      <div className="bg-gradient-to-r from-slate-50 to-primary-50/30 dark:from-slate-900/80 dark:to-primary-950/20 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <i className="fa-solid fa-palette text-sm" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                ตัวเลือกแยกสีตามชั้นยศ (Rank-Based Color Scheme)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ควบคุมโทนสีขององค์ประกอบบัตรที่ตั้งค่าให้เปลี่ยนสีอัตโนมัติตามชั้นยศ
              </span>
            </div>
          </div>

          {/* Color Mode Switcher */}
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => handleRankColorDirectUpdate('badgeColorMode', 'auto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                colorMode !== 'custom'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-award text-xs" />
              <span>แยกสีตามชั้นยศ</span>
            </button>
            <button
              type="button"
              onClick={() => handleRankColorDirectUpdate('badgeColorMode', 'custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                colorMode === 'custom'
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-paintbrush text-xs" />
              <span>ใช้สีเดียวทั้งระบบ</span>
            </button>
          </div>
        </div>

        {/* Dynamic Rank Colors Grid */}
        {colorMode !== 'custom' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 animate-fade-in">
            {/* Tier 1: Commissioned */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-red-400/50 transition">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorCommissioned }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    นายทหารสัญญาบัตร
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">ชั้นยศ ร.ต. - พล.อ.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  name="colorCommissioned"
                  value={colorCommissioned}
                  onChange={(e) => handleRankColorDirectUpdate('colorCommissioned', e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent shadow-xs"
                />
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-16">
                  {colorCommissioned}
                </span>
              </div>
            </div>

            {/* Tier 2: Non-Commissioned */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-amber-400/50 transition">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorNonCommissioned }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    นายทหารประทวน / ลูกจ้าง
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">ส.ต. - จ.ส.อ. และพนักงานราชการ</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  name="colorNonCommissioned"
                  value={colorNonCommissioned}
                  onChange={(e) => handleRankColorDirectUpdate('colorNonCommissioned', e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent shadow-xs"
                />
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-16">
                  {colorNonCommissioned}
                </span>
              </div>
            </div>

            {/* Tier 3: Conscript */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-400/50 transition">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorConscript }} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    ทหารกองประจำการ
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">พลทหารประจำการ / ผลัด ๑-๒</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  name="colorConscript"
                  value={colorConscript}
                  onChange={(e) => handleRankColorDirectUpdate('colorConscript', e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent shadow-xs"
                />
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-16">
                  {colorConscript}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Single Custom Primary Color */
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                สีหลักประจำองค์กร (Custom Accent Color)
              </span>
              <span className="text-[10px] text-slate-400">
                ใช้งานสีนี้เป็นสีหลักของบัตรสำหรับบุคลากรทุกชั้นยศทั่วทั้งองค์กร
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="badgeCustomColor"
                value={badgeCustomColor}
                onChange={(e) => handleRankColorDirectUpdate('badgeCustomColor', e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent shadow-xs"
              />
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                {badgeCustomColor}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 2: ข้อมูลองค์กรและด้านหลังบัตร (COLLAPSIBLE) ───────── */}
      {showOrgSettings && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-building text-primary-500" />
              <span>ข้อมูลหน่วยงานและด้านหลังบัตร (Back Side & Organization)</span>
            </span>
            <span className="text-[11px] text-slate-400">ผูกกับตัวแปร {`{organizationName}`}, {`{organizationAddress}`} ใน Canvas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input
                id="organizationName"
                type="text"
                name="organizationName"
                label="ชื่อหน่วยงาน / ต้นสังกัด"
                placeholder="กองทัพบก / กระทรวงกลาโหม"
                value={settings.organizationName ?? ''}
                onChange={handleChange}
                list="dept-options-list"
              />
              <datalist id="dept-options-list">
                {departments.map((d: any) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
              {departments.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">เลือกจากหน่วยในระบบ:</span>
                  <select
                    className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setSettings((prev: any) => ({ ...prev, organizationName: e.target.value }));
                      }
                    }}
                  >
                    <option value="">-- คลิกเพื่อเลือกหน่วยงาน --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <Input
              id="organizationPhone"
              type="text"
              name="organizationPhone"
              label="เบอร์โทรศัพท์หน่วยงาน"
              placeholder="02-297-7000"
              value={settings.organizationPhone ?? ''}
              onChange={handleChange}
            />
          </div>

          <Input
            id="organizationAddress"
            type="text"
            name="organizationAddress"
            label="ที่อยู่หน่วยงานสำหรับส่งคืน"
            placeholder="ถนนราชดำเนินนอก แขวงบางขุนพรหม เขตพระนคร กรุงเทพฯ 10200"
            value={settings.organizationAddress ?? ''}
            onChange={handleChange}
          />

          <div className="space-y-1">
            <label htmlFor="cardTermsConditions" className="block text-xs text-slate-600 dark:text-slate-400 font-medium">
              ข้อกำหนดและระเบียบการใช้บัตร
            </label>
            <textarea
              id="cardTermsConditions"
              name="cardTermsConditions"
              rows={3}
              placeholder="1. บัตรนี้เป็นทรัพย์สินของทางราชการ ห้ามโอนให้ผู้อื่นนำไปใช้&#10;2. กรณีบัตรสูญหายหรือชำรุด ให้รีบแจ้งหน่วยงานต้นสังกัดทันที&#10;3. หากเก็บได้กรุณาส่งคืนตามที่อยู่ด้านบน"
              value={settings.cardTermsConditions ?? ''}
              onChange={handleChange as any}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 resize-none shadow-xs"
            />
          </div>
        </div>
      )}

      {/* ─── SECTION 3: CANVAS STUDIO EDITOR ──────────────────────────────────── */}
      <div className="w-full">
        <BadgeCanvasEditor
          initialElements={parseConfig(settings.badgeCanvasConfig)}
          initialBackElements={parseConfig(settings.badgeBackCanvasConfig)}
          onChange={(elements) =>
            setSettings((prev: any) => ({ ...prev, badgeCanvasConfig: JSON.stringify(elements) }))
          }
          onBackChange={(elements) =>
            setSettings((prev: any) => ({ ...prev, badgeBackCanvasConfig: JSON.stringify(elements) }))
          }
          rankColors={{
            colorMode,
            customColor: badgeCustomColor,
            commissioned: colorCommissioned,
            nonCommissioned: colorNonCommissioned,
            conscript: colorConscript,
          }}
          onRankColorsChange={(updated) => {
            setSettings((prev: any) => ({
              ...prev,
              ...(updated.colorMode !== undefined ? { badgeColorMode: updated.colorMode } : {}),
              ...(updated.customColor !== undefined ? { badgeCustomColor: updated.customColor } : {}),
              ...(updated.commissioned !== undefined ? { colorCommissioned: updated.commissioned } : {}),
              ...(updated.nonCommissioned !== undefined ? { colorNonCommissioned: updated.nonCommissioned } : {}),
              ...(updated.conscript !== undefined ? { colorConscript: updated.conscript } : {}),
            }));
          }}
        />
      </div>
    </div>
  );
}
