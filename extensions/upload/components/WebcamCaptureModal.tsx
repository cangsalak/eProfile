'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Camera,
  RefreshCw,
  Check,
  RotateCcw,
  Grid,
  User,
  Timer,
  Sparkles,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';

export type CompositionGuideType = 'id-photo' | 'avatar' | 'grid' | 'crosshair' | 'none';

export interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
  defaultGuide?: CompositionGuideType;
  title?: string;
  variant?: 'avatar' | 'id-photo' | 'landscape' | 'map' | 'square' | 'auto';
}

export function WebcamCaptureModal({
  isOpen,
  onClose,
  onCapture,
  defaultGuide,
  title,
  variant = 'id-photo',
}: WebcamCaptureModalProps) {
  const webcamRef = useRef<Webcam>(null);

  // Determine initial guide based on variant
  const getInitialGuide = useCallback((): CompositionGuideType => {
    if (defaultGuide) return defaultGuide;
    if (variant === 'id-photo') return 'id-photo';
    if (variant === 'avatar') return 'avatar';
    if (variant === 'map' || variant === 'landscape') return 'grid';
    return 'id-photo';
  }, [defaultGuide, variant]);

  const [guideType, setGuideType] = useState<CompositionGuideType>(getInitialGuide);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [countdownDelay, setCountdownDelay] = useState<number>(0); // 0 = instant, 3 = 3s
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setGuideType(getInitialGuide());
      setIsCountdownActive(false);
      setCountdown(null);
      setIsCameraReady(false);
      setCameraError(null);
    }
  }, [isOpen, getInitialGuide, retryKey]);

  // Snap photo logic
  const snapPhoto = useCallback(() => {
    // Shutter flash effect
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const imageSrc = webcamRef.current?.getScreenshot({
      width: 1280,
      height: 960,
    });

    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // Handle capture button trigger with optional countdown
  const handleTriggerCapture = () => {
    if (countdownDelay > 0) {
      setIsCountdownActive(true);
      setCountdown(countdownDelay);

      let current = countdownDelay;
      const interval = setInterval(() => {
        current -= 1;
        if (current > 0) {
          setCountdown(current);
        } else {
          clearInterval(interval);
          setIsCountdownActive(false);
          setCountdown(null);
          snapPhoto();
        }
      }, 1000);
    } else {
      snapPhoto();
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFacingMode = () => {
    setIsCameraReady(false);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleRetryCamera = () => {
    setIsCameraReady(false);
    setCameraError(null);
    setRetryKey((prev) => prev + 1);
  };

  const modalTitle =
    title ||
    (variant === 'id-photo'
      ? 'ถ่ายภาพบุคคล (Official ID Photo 4.5 × 6 ซม.)'
      : 'ถ่ายรูปจากกล้อง (Webcam)');

  const modalSubtitle = capturedImage
    ? 'ตรวจสอบความคมชัดและความถูกต้องของภาพก่อนบันทึกใช้งาน'
    : 'จัดวางองค์ประกอบใบหน้าและแนวไหล่ให้อยู่ในกรอบนำสายตา';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon="fa-solid fa-camera"
      size="lg"
      className="p-0 overflow-hidden"
      footer={
        <div className="w-full flex flex-col gap-3">
          {!capturedImage ? (
            <>
              {/* Guidelines Segmented Tabs */}
              <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs self-center max-w-full overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setGuideType('id-photo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    guideType === 'id-photo'
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  รูปติดบัตร 4.5×6
                </button>
                <button
                  type="button"
                  onClick={() => setGuideType('avatar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    guideType === 'avatar'
                      ? 'bg-primary-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  โปรไฟล์วงกลม
                </button>
                <button
                  type="button"
                  onClick={() => setGuideType('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    guideType === 'grid'
                      ? 'bg-primary-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  ตาราง 9 ช่อง
                </button>
                <button
                  type="button"
                  onClick={() => setGuideType('none')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    guideType === 'none'
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ปิดเส้นนำ
                </button>
              </div>

              {/* Shutter Bar */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl text-xs px-4"
                >
                  ยกเลิก
                </Button>

                {/* Pro Studio Dual-Ring Shutter Button */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleTriggerCapture}
                    disabled={isCountdownActive || !isCameraReady || !!cameraError}
                    className="group relative w-16 h-16 rounded-full border-4 border-slate-300 dark:border-white/80 p-1 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 shadow-xl hover:shadow-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="กดถ่ายรูป"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 group-hover:from-amber-500 group-hover:to-amber-400 flex items-center justify-center text-white transition-colors shadow-inner">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {countdownDelay > 0 ? `นับถอยหลัง ${countdownDelay}s` : 'กดเพื่อถ่ายภาพ'}
                  </span>
                </div>

                <div className="w-20 text-right">
                  <span className="text-[10px] font-mono text-slate-400">
                    HD 1080p
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Review State Buttons */
            <div className="flex items-center justify-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="flex-1 max-w-[200px] rounded-xl text-xs py-2.5"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ถ่ายใหม่ (Retake)
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex-1 max-w-[240px] rounded-xl text-xs py-2.5 font-bold"
              >
                <Check className="w-4 h-4 mr-2" />
                ยืนยันใช้รูปนี้
              </Button>
            </div>
          )}
        </div>
      }
    >
      {/* Studio Viewfinder Area */}
      <div className="relative w-full bg-black overflow-hidden flex items-center justify-center min-h-[360px] sm:min-h-[420px]">
        {/* Shutter Flash Animation */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-50 transition-opacity duration-200" />
        )}

        {/* Countdown Overlay */}
        {isCountdownActive && countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-primary-500/90 text-white font-black text-6xl flex items-center justify-center shadow-2xl border-4 border-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {capturedImage ? (
          /* Captured Preview */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/60 max-h-[360px] sm:max-h-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt="Captured Preview"
                className="max-h-[360px] sm:max-h-[400px] w-auto object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> บันทึกภาพเรียบร้อย
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary-400" />
              หากภาพคมชัดและจัดวางตรงตามต้องการ สามารถกดปุ่ม &quot;ยืนยันใช้รูปนี้&quot; ได้ทันที
            </p>
          </div>
        ) : (
          /* Live Stream & Guides */
          <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] flex items-center justify-center bg-slate-950">
            {/* Loading Spinner */}
            {!isCameraReady && !cameraError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white p-6 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
                <p className="text-sm font-semibold text-slate-200">
                  กำลังเชื่อมต่อกล้องเว็บแคม...
                </p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  หากเบราว์เซอร์ถามการอนุญาต ให้กด &quot;อนุญาต (Allow)&quot; การเข้าถึงกล้อง
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {cameraError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white p-6 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white text-center">
                  ไม่สามารถเข้าถึงกล้องเว็บแคมได้
                </h4>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  {cameraError || 'กรุณาตรวจสอบว่าคุณได้อนุญาตสิทธิ์การใช้งานกล้องในเบราว์เซอร์แล้ว หรือไม่มีแอปพลิเคชันอื่นกำลังใช้งานกล้องอยู่'}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleRetryCamera}
                  className="mt-2 text-xs py-2 px-4"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  ลองเชื่อมต่อกล้องอีกครั้ง
                </Button>
              </div>
            )}

            <Webcam
              key={`webcam-${facingMode}-${retryKey}`}
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              onUserMedia={() => {
                setIsCameraReady(true);
                setCameraError(null);
              }}
              onUserMediaError={(err: any) => {
                console.error('Webcam user media error:', err);
                setIsCameraReady(false);
                setCameraError(
                  typeof err === 'string'
                    ? err
                    : err.message || 'ไม่ได้รับอนุญาตให้เข้าถึงกล้องเว็บแคม'
                );
              }}
              videoConstraints={{
                facingMode,
              }}
              className="w-full h-full object-cover"
              mirrored={facingMode === 'user'}
            />

            {/* Viewfinder Corner L-Brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/60 pointer-events-none rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/60 pointer-events-none rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/60 pointer-events-none rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/60 pointer-events-none rounded-br-sm" />

            {/* Composition Guidelines Overlays */}
            {isCameraReady && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 1. Official ID Photo 4.5x6 Standard Overlay */}
                {guideType === 'id-photo' && (
                  <div className="relative w-[260px] sm:w-[300px] aspect-[3/4] border-2 border-amber-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col items-center justify-between p-3 overflow-hidden">
                    {/* Corner Marks inside ID Box */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

                    {/* Pro Head/Face Silhouette Outline */}
                    <div className="relative mt-2 w-32 sm:w-36 h-44 sm:h-48 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-amber-300/80 bg-amber-400/5 flex flex-col items-center justify-center shadow-xs">
                      {/* Eye Level Line */}
                      <div className="w-full border-t border-dotted border-amber-300/80 absolute top-[42%] flex items-center justify-between px-1">
                        <span className="text-[8px] tracking-wider bg-slate-950/80 text-amber-300 px-1 py-0.5 rounded-xs font-mono">
                          ระดับสายตา
                        </span>
                        <span className="text-[8px] tracking-wider bg-slate-950/80 text-amber-300 px-1 py-0.5 rounded-xs font-mono">
                          ระดับสายตา
                        </span>
                      </div>
                      {/* Center Axis */}
                      <div className="h-full border-l border-dotted border-amber-300/50 absolute left-1/2 -translate-x-1/2" />
                      {/* Chin Line */}
                      <div className="w-3/4 border-t border-dotted border-amber-300/80 absolute bottom-2 flex items-center justify-center">
                        <span className="text-[8px] tracking-wider bg-slate-950/80 text-amber-300 px-1 py-0.5 rounded-xs font-mono">
                          ระดับคาง
                        </span>
                      </div>
                    </div>

                    {/* Shoulder Guide */}
                    <div className="w-full h-11 border-t-2 border-dashed border-amber-300/80 rounded-t-[36px] bg-amber-500/5 mt-auto flex items-center justify-center">
                      <span className="text-[9px] text-amber-200 bg-slate-950/90 px-2 py-0.5 rounded-full font-medium border border-amber-400/30">
                        แนวระดับหัวไหล่
                      </span>
                    </div>

                    {/* Top Badge */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] bg-slate-950/90 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/40 backdrop-blur-xs">
                      กรอบมาตรฐาน 4.5 × 6 ซม.
                    </div>
                  </div>
                )}

                {/* 2. Avatar Circular Guide */}
                {guideType === 'avatar' && (
                  <div className="relative w-64 sm:w-72 aspect-square rounded-full border-2 border-primary-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex items-center justify-center">
                    <div className="w-36 h-48 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-primary-300/80 bg-primary-400/5 relative flex items-center justify-center">
                      <div className="w-full border-t border-dotted border-primary-300/60 absolute top-[44%]" />
                      <div className="h-full border-l border-dotted border-primary-300/50 absolute left-1/2 -translate-x-1/2" />
                    </div>
                    <div className="absolute -top-6 text-[10px] bg-slate-950/90 text-primary-300 font-medium px-2.5 py-0.5 rounded-full border border-primary-400/30">
                      กรอบรูปโปรไฟล์
                    </div>
                  </div>
                )}

                {/* 3. Rule of Thirds Grid (9 ช่อง) */}
                {guideType === 'grid' && (
                  <div className="relative w-full h-full border border-white/20 pointer-events-none">
                    <div className="absolute top-0 bottom-0 left-1/3 border-l border-dashed border-white/40" />
                    <div className="absolute top-0 bottom-0 left-2/3 border-l border-dashed border-white/40" />
                    <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-white/40" />
                    <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-white/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-primary-400/80 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                    </div>
                  </div>
                )}

                {/* 4. Crosshair */}
                {guideType === 'crosshair' && (
                  <div className="relative w-4/5 h-4/5 border-2 border-dashed border-primary-400/60 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                    <div className="absolute top-0 bottom-0 left-1/2 border-l border-dotted border-primary-300/40" />
                    <div className="absolute left-0 right-0 top-1/2 border-t border-dotted border-primary-300/40" />
                    <div className="w-8 h-8 border border-primary-400/70 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Floating Camera Status & HUD Bar (Top Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-full border border-slate-700/80 shadow-lg pointer-events-auto">
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold px-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isCameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isCameraReady ? 'LIVE' : 'CONNECTING'}
              </span>
              <div className="h-3 w-px bg-slate-700" />
              <button
                type="button"
                title="สลับกล้องหน้า/หลัง"
                onClick={toggleFacingMode}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="h-3 w-px bg-slate-700" />
              <button
                type="button"
                title={countdownDelay === 0 ? 'ถ่ายทันที (0s)' : `นับถอยหลัง ${countdownDelay} วินาที`}
                onClick={() => setCountdownDelay((prev) => (prev === 0 ? 3 : 0))}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  countdownDelay > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Timer className="w-3 h-3" />
                <span>{countdownDelay > 0 ? `${countdownDelay}s` : '0s'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
