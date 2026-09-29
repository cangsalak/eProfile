'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge, Switch } from '@/components/ui';

export default function S3ConfigForm() {
  const [provider, setProvider] = useState<'LOCAL' | 'S3'>('LOCAL');
  const [s3Endpoint, setS3Endpoint] = useState('');
  const [s3Region, setS3Region] = useState('ap-southeast-1');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3AccessKeyId, setS3AccessKeyId] = useState('');
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState('');
  const [s3PublicUrl, setS3PublicUrl] = useState('');
  const [s3ForcePathStyle, setS3ForcePathStyle] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Load Settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/modules/upload/s3-settings');
      if (res.ok) {
        const data = await res.json();
        setProvider(data.provider || 'LOCAL');
        setS3Endpoint(data.s3Endpoint || '');
        setS3Region(data.s3Region || 'ap-southeast-1');
        setS3Bucket(data.s3Bucket || '');
        setS3AccessKeyId(data.s3AccessKeyId || '');
        setS3SecretAccessKey(data.s3SecretAccessKey || '');
        setS3PublicUrl(data.s3PublicUrl || '');
        setS3ForcePathStyle(!!data.s3ForcePathStyle);
      }
    } catch (err) {
      console.error('Failed to load S3 settings', err);
      toast.error('ไม่สามารถโหลดการตั้งค่า S3 ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Presets
  const applyPreset = (preset: 'aws' | 'minio' | 'r2' | 'wasabi' | 'local') => {
    setTestResult(null);
    if (preset === 'local') {
      setProvider('LOCAL');
      toast.success('เลือกโหมดจัดเก็บในเครื่องเซิร์ฟเวอร์ (Local Disk)');
      return;
    }

    setProvider('S3');
    switch (preset) {
      case 'aws':
        setS3Endpoint('');
        setS3Region('ap-southeast-1');
        setS3ForcePathStyle(false);
        setS3PublicUrl('');
        toast.success('ตั้งค่าเริ่มต้นสำหรับ AWS S3 เรียบร้อย');
        break;
      case 'minio':
        setS3Endpoint('http://localhost:9000');
        setS3Region('us-east-1');
        setS3ForcePathStyle(true);
        toast.success('ตั้งค่าเริ่มต้นสำหรับ MinIO (Self-hosted) เรียบร้อย');
        break;
      case 'r2':
        setS3Endpoint('https://<ACCOUNT_ID>.r2.cloudflarestorage.com');
        setS3Region('auto');
        setS3ForcePathStyle(false);
        setS3PublicUrl('https://pub-xxxx.r2.dev');
        toast.success('ตั้งค่าเริ่มต้นสำหรับ Cloudflare R2 เรียบร้อย');
        break;
      case 'wasabi':
        setS3Endpoint('https://s3.ap-southeast-1.wasabisys.com');
        setS3Region('ap-southeast-1');
        setS3ForcePathStyle(false);
        toast.success('ตั้งค่าเริ่มต้นสำหรับ Wasabi Cloud Storage เรียบร้อย');
        break;
    }
  };

  // Test S3 Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/modules/upload/s3-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          s3Endpoint,
          s3Region,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey,
          s3PublicUrl,
          s3ForcePathStyle,
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        toast.success(data.message || 'เชื่อมต่อ S3 สำเร็จ');
      } else {
        toast.error(data.message || 'การเชื่อมต่อ S3 ล้มเหลว');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
      toast.error('เกิดข้อผิดพลาดในการทดสอบ');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/modules/upload/s3-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          s3Endpoint,
          s3Region,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey,
          s3PublicUrl,
          s3ForcePathStyle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'บันทึกการตั้งค่าจัดเก็บข้อมูลสำเร็จ');
        await fetchSettings();
      } else {
        toast.error(data.error || 'บันทึกการตั้งค่าไม่สำเร็จ');
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 font-prompt">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">กำลังโหลดการตั้งค่า S3...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-prompt animate-fade-in max-w-4xl mx-auto">
      {/* ── 1. Provider Selection Card ── */}
      <Card variant="convex" padding="md" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                เลือกประเภทการจัดเก็บ (Storage Provider)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                เลือกบันทึกลงเครื่องเซิร์ฟเวอร์ หรือเชื่อมต่อ Cloud Object Storage ภายนอก
              </p>
            </div>
          </div>
          <Badge variant={provider === 'S3' ? 'primary' : 'neutral'} size="sm">
            <i className={provider === 'S3' ? 'fa-solid fa-cloud mr-1.5' : 'fa-solid fa-hard-drive mr-1.5'}></i>
            {provider === 'S3' ? 'Cloud S3' : 'Local Disk'}
          </Badge>
        </div>

        {/* Provider Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => applyPreset('local')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
              provider === 'LOCAL'
                ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-2 shadow-xs">
              <i className="fa-solid fa-hard-drive text-sm"></i>
            </div>
            <span className="text-xs font-bold block">Local Disk</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">เซิร์ฟเวอร์ภายใน</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('aws')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
              provider === 'S3' && (!s3Endpoint || s3Endpoint.includes('amazonaws.com'))
                ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 shadow-xs">
              <i className="fa-brands fa-aws text-sm"></i>
            </div>
            <span className="text-xs font-bold block">AWS S3</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Amazon S3</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('r2')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
              provider === 'S3' && s3Endpoint.includes('r2.cloudflarestorage')
                ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2 shadow-xs">
              <i className="fa-brands fa-cloudflare text-sm"></i>
            </div>
            <span className="text-xs font-bold block">Cloudflare R2</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Zero Egress</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('minio')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
              provider === 'S3' && (s3Endpoint.includes('localhost') || s3Endpoint.includes(':9000') || s3ForcePathStyle)
                ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 shadow-xs">
              <i className="fa-solid fa-server text-sm"></i>
            </div>
            <span className="text-xs font-bold block">MinIO S3</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Self-hosted</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('wasabi')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
              provider === 'S3' && s3Endpoint.includes('wasabisys')
                ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-xs">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <span className="text-xs font-bold block">Wasabi S3</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Hot Storage</span>
          </button>
        </div>
      </Card>

      {/* ── 2. Main Parameters Form ── */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card variant="convex" padding="md" className="space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-sliders text-primary-500 text-sm"></i>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                พารามิเตอร์การเชื่อมต่อ (Storage Parameters)
              </h3>
            </div>
            <span className="text-xs text-slate-400">AWS Signature Version 4</span>
          </div>

          {provider === 'LOCAL' ? (
            <div className="p-8 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto shadow-inner">
                <i className="fa-solid fa-hard-drive text-2xl"></i>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                โหมดจัดเก็บบนเครื่องแม่ข่าย (Local Storage Path: public/uploads/)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                ไฟล์ทั้งหมดจะถูกบันทึกลงในไดรฟ์ของเซิร์ฟเวอร์โดยตรงผ่าน URL สาธารณะ <code>/uploads/...</code> เหมาะสำหรับระบบใช้งานภายในหน่วยงาน หรือทดสอบการทำงาน
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* S3 Bucket & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    S3 Bucket Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="เช่น eprofile-media-bucket"
                    value={s3Bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    icon="fa-solid fa-box-archive"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">ชื่อ Bucket บนระบบ Cloud Storage</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Region (ภูมิภาค) *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="เช่น ap-southeast-1 หรือ auto"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    icon="fa-solid fa-globe"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">เช่น ap-southeast-1 (Singapore), auto (R2)</p>
                </div>
              </div>

              {/* S3 Endpoint */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  S3 Custom Endpoint URL (สำหรับ MinIO / Cloudflare R2 / Wasabi)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น https://<account-id>.r2.cloudflarestorage.com (เว้นว่างหากใช้ AWS S3 ปกติ)"
                  value={s3Endpoint}
                  onChange={(e) => setS3Endpoint(e.target.value)}
                  icon="fa-solid fa-link"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  เว้นว่างไว้หากใช้ Standard Amazon S3
                </p>
              </div>

              {/* S3 Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Access Key ID *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={s3AccessKeyId}
                    onChange={(e) => setS3AccessKeyId(e.target.value)}
                    icon="fa-solid fa-key"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Secret Access Key *
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecretKey ? 'text' : 'password'}
                      required
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={s3SecretAccessKey}
                      onChange={(e) => setS3SecretAccessKey(e.target.value)}
                      icon="fa-solid fa-lock"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs"
                    >
                      <i className={showSecretKey ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom CDN / Public URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Public Base URL (CDN Domain)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น https://cdn.eprofile.rta.mi.th หรือ https://pub-xxxx.r2.dev"
                  value={s3PublicUrl}
                  onChange={(e) => setS3PublicUrl(e.target.value)}
                  icon="fa-solid fa-network-wired"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ระบุหากต้องการให้ไฟล์เข้าถึงผ่าน CDN โดเมนเฉพาะแทนที่ S3 Direct URL
                </p>
              </div>

              {/* Force Path Style Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Force Path Style URLs (บังคับใช้ Path-style)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    จำเป็นต้องเปิดเมื่อใช้งานกับ MinIO หรือเซิร์ฟเวอร์ S3 ที่ไม่มี Wildcard DNS
                  </span>
                </div>
                <Switch
                  checked={s3ForcePathStyle}
                  onChange={setS3ForcePathStyle}
                />
              </div>
            </div>
          )}

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              <i className={`text-base mt-0.5 ${testResult.success ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-circle-exclamation text-rose-600'}`}></i>
              <div className="flex-1">
                <span className="font-bold block text-sm">
                  {testResult.success ? 'ทดสอบการเชื่อมต่อสำเร็จ' : 'ทดสอบการเชื่อมต่อล้มเหลว'}
                </span>
                <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {provider === 'S3' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={isTesting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-plug'}
                onClick={handleTestConnection}
                disabled={isTesting || !s3Bucket}
                className="font-bold"
              >
                {isTesting ? 'กำลังทดสอบการเชื่อมต่อ...' : 'ทดสอบการเชื่อมต่อ S3'}
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'}
              disabled={isSaving}
              className="font-bold shadow-sm"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าจัดเก็บข้อมูล'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
