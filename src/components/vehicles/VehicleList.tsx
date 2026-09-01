'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types/personnel';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';
import toast from 'react-hot-toast';

interface VehicleListProps {
  personnelId: string;
}

export default function VehicleList({ personnelId }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vehicles?personnelId=${personnelId}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personnelId) {
      fetchVehicles();
    }
  }, [personnelId]);

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles';
      const method = editingVehicle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (!res.ok) throw new Error('Failed to save vehicle');
      
      await fetchVehicles();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('ลบข้อมูลสำเร็จ');
        await fetchVehicles();
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="py-8 text-center text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูลยานพาหนะ...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-3">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <i className="fa-solid fa-car-rear mr-2 text-primary-400"></i>
          ยานพาหนะของฉัน (My Vehicles)
          <span className="ml-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">{vehicles.length} คัน</span>
        </h4>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all text-sm font-medium flex items-center shadow-lg"
        >
          <i className="fa-solid fa-plus mr-2"></i> เพิ่มยานพาหนะ
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/30 rounded-xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fa-solid fa-car text-2xl text-slate-500"></i>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">คุณยังไม่มีข้อมูลยานพาหนะในระบบ</p>
          <button 
            onClick={openAddModal}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            + เพิ่มข้อมูลยานพาหนะคันแรกของคุณ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onEdit={openEditModal} 
              onDelete={handleDeleteVehicle} 
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <VehicleFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveVehicle} 
          initialData={editingVehicle}
          personnelId={personnelId}
        />
      )}
    </div>
  );
}
