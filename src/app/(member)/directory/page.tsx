'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Personnel } from '@/types/personnel';
import Navbar from '@/components/Navbar';
import BannerSummary from '@/components/BannerSummary';
import SearchFilter from '@/components/SearchFilter';
import PersonnelCard from '@/components/PersonnelCard';
import ProfileModal from '@/components/ProfileModal';
import AddPersonnelModal from '@/components/AddPersonnelModal';
import ScannerModal from '@/components/ScannerModal';
import PrintBadgeView from '@/components/PrintBadgeView';

export default function EProfilePage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');
  const [activeProfile, setActiveProfile] = useState<Personnel | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Load personnel from SQLite API
  const fetchPersonnel = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/personnel?all=true');
      if (res.ok) {
        const data = await res.json();
        setPersonnelList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to load personnel from SQLite DB', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchSettings();
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [personnelList, searchQuery, selectedDept]);

  const departments = ['ทั้งหมด', ...Array.from(new Set(personnelList.map((p) => p.department)))];

  const filteredList = personnelList.filter((person) => {
    const matchDept = selectedDept === 'ทั้งหมด' || person.department === selectedDept;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      person.firstName.toLowerCase().includes(q) ||
      person.lastName.toLowerCase().includes(q) ||
      person.badgeNo.toLowerCase().includes(q) ||
      person.position.toLowerCase().includes(q) ||
      person.department.toLowerCase().includes(q);

    return matchDept && matchSearch;
  });

  const handleAddPersonnel = async (created: Personnel) => {
    try {
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });

      if (res.ok) {
        fetchPersonnel();
      }
    } catch (err) {
      console.error('Failed to create personnel', err);
    }
  };

  const handlePrintCard = (person: Personnel) => {
    setActiveProfile(person);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 no-print">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ทำเนียบบุคลากร</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all font-medium flex items-center"
          >
            <i className="fa-solid fa-barcode mr-2 text-primary-400"></i>
            สแกนตรวจสอบ
          </button>
          
          {currentUser && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/30 transition-all font-medium flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              เพิ่มบุคลากร
            </button>
          )}
        </div>
      </div>

      <main className="no-print">
        <BannerSummary
          totalPersonnel={personnelList.length}
          totalDepartments={departments.length - 1}
        />

        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          departments={departments}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
        />

        {isLoading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400 mb-3 block"></i>
            <p className="text-sm text-slate-500 dark:text-slate-400">กำลังเชื่อมต่อ SQLite Database...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {filteredList.slice(0, visibleCount).map((person) => (
                <PersonnelCard
                  key={person.id}
                  person={person}
                  settings={settings}
                  isGuest={!currentUser}
                  onViewProfile={setActiveProfile}
                  onPrintCard={handlePrintCard}
                />
              ))}
            </div>
            
            {/* Observer Target for Infinite Scroll */}
            {visibleCount < filteredList.length ? (
              <div ref={observerTarget} className="py-8 w-full flex justify-center">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-slate-400"></i>
              </div>
            ) : filteredList.length > 0 ? (
              <div className="py-12 w-full text-center text-slate-400 dark:text-slate-500 text-sm">
                — หมดข้อมูลแล้ว —
              </div>
            ) : (
              <div className="py-12 w-full text-center text-slate-400 dark:text-slate-500 text-sm">
                ไม่พบข้อมูลที่ค้นหา
              </div>
            )}
          </div>
        )}
      </main>

      <ProfileModal
        person={activeProfile}
        onClose={() => setActiveProfile(null)}
        onPrintCard={handlePrintCard}
      />

      <AddPersonnelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPersonnel}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        personnelList={personnelList}
        settings={settings}
        isGuest={!currentUser}
      />

      <PrintBadgeView person={activeProfile} />
    </div>
  );
}
