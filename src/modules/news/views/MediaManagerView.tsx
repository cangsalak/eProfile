'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function ManageMediaPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('ลบไฟล์เรียบร้อย');
        fetchFiles();
      } else {
        toast.error('ไม่สามารถลบไฟล์ได้');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSimulateUpload = async () => {
    // Simulate upload for now
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `example-image-${Date.now()}.png`,
          url: `https://via.placeholder.com/150?text=Image+${Date.now()}`,
          size: Math.floor(Math.random() * 5000000) + 100000,
          mimetype: 'image/png'
        })
      });
      if (res.ok) fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">คลังสื่อและรูปภาพ (Media Library)</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการรูปภาพและไฟล์ต่างๆ ภายในระบบ</p>
        </div>
        <button 
          onClick={handleSimulateUpload}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <i className="fa-solid fa-cloud-arrow-up mr-2"></i>
          อัปโหลดรูปภาพจำลอง
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        {isLoading ? (
          <div className="text-center text-slate-500 py-12">กำลังโหลดข้อมูล...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <i className="fa-regular fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-3 block"></i>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">ไม่มีไฟล์ในคลัง</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">ยังไม่มีการอัปโหลดสื่อใดๆ ในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map(file => (
              <div key={file.id} className="group relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {file.mimetype.startsWith('image/') ? (
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-file text-4xl text-slate-400"></i>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatBytes(file.size)}
                  </p>
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setDeleteTargetId(file.id)}
                    className="w-8 h-8 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-md flex items-center justify-center transition-colors"
                    title="ลบไฟล์"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styled Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="ยืนยันการลบไฟล์สื่อ?"
        message="คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้ออกจากคลังสื่อของระบบ? (ข้อมูลระเบียนสื่อจะถูกลบออกจากฐานข้อมูล)"
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetId) {
            executeDeleteMedia(deleteTargetId);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
