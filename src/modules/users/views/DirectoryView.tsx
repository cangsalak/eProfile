'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Personnel } from '@/modules/users';
import Navbar from '@/components/Navbar';
import BannerSummary from '@/components/BannerSummary';
import SearchFilter from '../components/SearchFilter';
import PersonnelCard from '../components/PersonnelCard';
import ProfileModal from '../components/ProfileModal';
import AddPersonnelModal from '../components/AddPersonnelModal';
import ScannerModal from '../components/ScannerModal';
import PrintPreviewModal from '@/modules/print/components/PrintPreviewModal';
import IDBadge from '@/modules/badges/components/IDBadge';
import CR80Pair from '@/modules/badges/components/CR80Pair';
import { Button } from '@/components/ui/Button';

export default function EProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');

  useEffect(() => {
    const q = searchParams?.get('search');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  const [activeProfile, setActiveProfile] = useState<Personnel | null>(null);
  const [printPreviewPerson, setPrintPreviewPerson] = useState<Personnel | null>(null);
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

  // Load personnel from SQLite API (Always fresh with no-store)
  const fetchPersonnel = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/personnel?all=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPersonnelList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to load personnel from DB', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings?_t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });
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

    const handleSettingsChange = () => {
      fetchSettings();
    };

    const handlePersonnelChange = () => {
      fetchPersonnel();
    };

    const handleFocus = () => {
      fetchPersonnel();
    };

    window.addEventListener('eprofile-settings-change', handleSettingsChange);
    window.addEventListener('eprofile-personnel-change', handlePersonnelChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('eprofile-settings-change', handleSettingsChange);
      window.removeEventListener('eprofile-personnel-change', handlePersonnelChange);
      window.removeEventListener('focus', handleFocus);
    };
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
    setPrintPreviewPerson(person);
  };

  return (
    <div className="pb-12 space-y-5 font-prompt">
      <div className="flex justify-end items-center gap-2.5 no-print">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsScannerOpen(true)}
          icon="fa-solid fa-barcode"
          className="rounded-xl font-semibold shadow-xs"
        >
          สแกนตรวจสอบ
        </Button>

        {currentUser && (
          <Link href="/modules/users/new">
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon="fa-solid fa-plus"
              className="rounded-xl font-bold shadow-md shadow-primary-500/20"
            >
              เพิ่มบุคลากร
            </Button>
          </Link>
        )}
      </div>

      <main>
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

      {/* Direct Card Print Preview Modal */}
      {printPreviewPerson && (
        <PrintPreviewModal
          isOpen={Boolean(printPreviewPerson)}
          onClose={() => setPrintPreviewPerson(null)}
          onConfirmPrint={() => {
            sessionStorage.setItem('bulkPrintIds', JSON.stringify([printPreviewPerson.id]));
            router.push(`/modules/badges?id=${printPreviewPerson.id}`);
          }}
          title={`บัตรประจำตัว: ${printPreviewPerson.prefix || ''}${printPreviewPerson.firstName} ${printPreviewPerson.lastName}`}
          paperSettings={{
            pageSize: 'A4',
            orientation: 'portrait',
            margin: '8mm',
            showGaruda: false,
            watermark: 'none',
            showSignature: false,
            unitName: printPreviewPerson.department || '',
          }}
        >
          <div className="p-4 flex flex-col items-center">
            <CR80Pair
              showCropMarks={false}
              front={
                <IDBadge
                  personnel={printPreviewPerson}
                  settings={settings}
                  qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${printPreviewPerson.id}` : ''}
                />
              }
              back={
                <IDBadge
                  personnel={printPreviewPerson}
                  settings={settings}
                  qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${printPreviewPerson.id}` : ''}
                  isBack={true}
                />
              }
            />
          </div>
        </PrintPreviewModal>
      )}
    </div>
  );
}
