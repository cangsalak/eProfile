'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface ImageUploadBoxProps {
  label: string;
  imageUrl?: string | null;
  onChange: (base64: string) => void;
  onRemove?: () => void;
}

export default function ImageUploadBox({ label, imageUrl, onChange, onRemove }: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const processImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        
        let targetWidth = img.width;
        let targetHeight = img.height;
        
        if (img.width > MAX_WIDTH) {
          targetWidth = MAX_WIDTH;
          targetHeight = img.height * scaleSize;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        onChange(base64);
        setIsWebcamOpen(false);
      };
      img.src = src;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
        processImage(imageSrc);
    }
  }, [webcamRef]);

  if (isWebcamOpen) {
      return (
          <div className="flex flex-col items-center">
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-2">{label} (กล้อง)</label>
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative flex items-center justify-center shadow-inner">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button type="button" onClick={() => setIsWebcamOpen(false)} className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 backdrop-blur-sm text-white rounded-lg text-sm transition-colors border border-slate-500/50">
                        ยกเลิก
                    </button>
                    <button type="button" onClick={capture} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-colors border border-primary-400/50">
                        <i className="fa-solid fa-camera mr-2"></i> ถ่ายรูป
                    </button>
                </div>
            </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <label className="block text-slate-500 dark:text-slate-400 text-xs mb-2">{label}</label>
      
      <div 
        className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group shadow-sm
          ${imageUrl ? 'border-primary-500 bg-white dark:bg-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 hover:dark:bg-slate-800 hover:border-primary-400'}`}
        onClick={() => !imageUrl && fileInputRef.current?.click()}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity">
              <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="w-10 h-10 bg-primary-500/90 hover:bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    title="เปลี่ยนรูปภาพ (อัปโหลด)"
                  >
                    <i className="fa-solid fa-upload"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsWebcamOpen(true); }}
                    className="w-10 h-10 bg-indigo-500/90 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    title="ถ่ายรูปใหม่ (กล้อง)"
                  >
                    <i className="fa-solid fa-camera"></i>
                  </button>
                  {onRemove && (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      className="w-10 h-10 bg-rose-500/90 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                      title="ลบรูปภาพ"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-slate-500 dark:text-slate-400 w-full">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <i className="fa-solid fa-image text-xl text-slate-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors"></i>
            </div>
            <p className="text-xs font-medium mb-1">คลิกเพื่ออัปโหลดภาพ</p>
            <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsWebcamOpen(true); }}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg text-xs flex items-center justify-center transition-all shadow-sm group-hover:shadow"
            >
                <i className="fa-solid fa-camera mr-2"></i> หรือเปิดกล้อง
            </button>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
