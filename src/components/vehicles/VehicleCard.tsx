'use client';

import React from 'react';
import { Vehicle } from '../../types/personnel';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  
  // Helper to safely get at least one photo for cover
  const coverPhoto = vehicle.photoFront || vehicle.photoSide || vehicle.photoBack || null;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden flex flex-col transition-all hover:bg-slate-900/60 hover:border-primary-500/30">
      
      {/* Cover Image */}
      <div className="h-40 w-full bg-slate-50 dark:bg-slate-800 relative group overflow-hidden">
        {coverPhoto ? (
          <img src={coverPhoto} alt="Vehicle Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <i className="fa-solid fa-car text-5xl opacity-50"></i>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-900 dark:text-white shadow-lg border border-slate-200 dark:border-slate-700/50">
          {vehicle.type === 'รถยนต์' ? <i className="fa-solid fa-car-side mr-2 text-primary-400"></i> : 
           vehicle.type === 'รถจักรยานยนต์' ? <i className="fa-solid fa-motorcycle mr-2 text-rose-400"></i> : 
           <i className="fa-solid fa-truck mr-2 text-emerald-400"></i>}
          {vehicle.type}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-wider bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md inline-block border border-slate-200 dark:border-slate-700">{vehicle.licensePlate}</h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{vehicle.brand} {vehicle.model}</p>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center">
          <span className="w-3 h-3 rounded-full mr-2 border border-slate-300 dark:border-slate-600" style={{ backgroundColor: vehicle.color === 'ขาว' ? '#ffffff' : vehicle.color === 'ดำ' ? '#000000' : vehicle.color === 'แดง' ? '#ef4444' : vehicle.color === 'เทา' ? '#9ca3af' : vehicle.color === 'บรอนซ์เงิน' ? '#d1d5db' : '#3b82f6' }}></span>
          สี: {vehicle.color}
        </p>

        {/* Small thumbnails for other angles if they exist */}
        <div className="flex gap-2 mb-4 mt-auto">
          {['photoFront', 'photoSide', 'photoBack'].map((key) => {
            const src = vehicle[key as keyof Vehicle] as string;
            if (!src) return null;
            return (
              <div key={key} className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700/50 pt-3">
          <button 
            onClick={() => onEdit(vehicle)}
            className="flex-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 py-1.5 rounded-lg text-xs font-medium transition-colors border border-primary-500/20"
          >
            <i className="fa-solid fa-edit mr-1"></i> แก้ไข
          </button>
          <button 
            onClick={() => {
              if (window.confirm(`คุณต้องการลบข้อมูลรถทะเบียน ${vehicle.licensePlate} ใช่หรือไม่?`)) {
                onDelete(vehicle.id);
              }
            }}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-rose-500/20"
            title="ลบข้อมูลรถ"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
