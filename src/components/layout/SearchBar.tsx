'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './icons';
import { ALL_SYSTEM_MODULES } from '@/lib/modules/registry';
import { cn } from '@/utils/cn';

interface SearchItem {
  id: string;
  title: string;
  titleEn?: string;
  parentTitle?: string;
  section: string;
  url: string;
  icon?: string;
}

interface PersonnelResult {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  rank?: string;
  position: string;
  department: string;
  subDepartment?: string;
  badgeNo: string;
  status: string;
  avatarUrl?: string;
  personnelType?: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [personnelResults, setPersonnelResults] = useState<PersonnelResult[]>([]);
  const [isSearchingPersonnel, setIsSearchingPersonnel] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setPersonnelResults([]);
    }
  }, [isOpen]);

  // Build searchable database of pages from modules & core routes
  const allSearchItems: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [
      {
        id: 'dashboard',
        title: 'หน้าหลัก (Dashboard)',
        titleEn: 'Main Dashboard Overview',
        section: 'ภาพรวมระบบ',
        url: '/dashboard',
        icon: 'fa-solid fa-chart-pie',
      },
      {
        id: 'settings',
        title: 'ตั้งค่าระบบทั่วไป',
        titleEn: 'General System Settings',
        section: 'การจัดการระบบ',
        url: '/settings',
        icon: 'fa-solid fa-gear',
      },
      {
        id: 'profile',
        title: 'โปรไฟล์ของฉัน',
        titleEn: 'My User Profile',
        section: 'ข้อมูลผู้ใช้',
        url: '/profile',
        icon: 'fa-solid fa-user',
      },
      {
        id: 'notifications',
        title: 'การแจ้งเตือนทั้งหมด',
        titleEn: 'All Notifications Inbox',
        section: 'ข้อมูลผู้ใช้',
        url: '/notifications',
        icon: 'fa-solid fa-bell',
      },
    ];

    // Extract all items from module manifests
    ALL_SYSTEM_MODULES.forEach((mod) => {
      const sectionLabel = mod.name;

      // Module main page
      items.push({
        id: `mod-${mod.id}`,
        title: mod.name,
        titleEn: mod.nameEn || mod.description,
        section: sectionLabel,
        url: `/modules/${mod.id}`,
        icon: mod.icon ? (mod.icon.startsWith('fa-') ? mod.icon : `fa-solid ${mod.icon}`) : 'fa-solid fa-cube',
      });

      // Module sub-menus
      mod.menus.forEach((menu) => {
        items.push({
          id: `menu-${menu.id}`,
          title: menu.title,
          section: sectionLabel,
          url: menu.path,
          icon: menu.icon,
        });

        if (menu.subItems) {
          menu.subItems.forEach((sub, idx) => {
            items.push({
              id: `sub-${menu.id}-${idx}`,
              title: sub.name,
              parentTitle: menu.title,
              section: sectionLabel,
              url: sub.path,
              icon: menu.icon,
            });
          });
        }
      });
    });

    // Deduplicate by URL
    const uniqueMap = new Map<string, SearchItem>();
    items.forEach((item) => {
      if (!uniqueMap.has(item.url)) {
        uniqueMap.set(item.url, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, []);

  // Filter items matching query
  const filteredPageItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSearchItems;

    return allSearchItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchTitleEn = item.titleEn?.toLowerCase().includes(q) || false;
      const matchParent = item.parentTitle?.toLowerCase().includes(q) || false;
      const matchSection = item.section.toLowerCase().includes(q);
      const matchUrl = item.url.toLowerCase().includes(q);
      return matchTitle || matchTitleEn || matchParent || matchSection || matchUrl;
    });
  }, [allSearchItems, query]);

  // Debounced fetch for personnel search
  const fetchPersonnel = useCallback(async (q: string) => {
    if (!q || q.length < 1) {
      setPersonnelResults([]);
      setIsSearchingPersonnel(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearchingPersonnel(true);
    try {
      const res = await fetch(`/api/personnel?search=${encodeURIComponent(q)}&limit=6`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const json = await res.json();
        const list: PersonnelResult[] = Array.isArray(json) ? json : json.data || [];
        setPersonnelResults(list);
      } else {
        setPersonnelResults([]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setPersonnelResults([]);
      }
    } finally {
      setIsSearchingPersonnel(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      fetchPersonnel(trimmed);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, fetchPersonnel]);

  // Flatten all navigable items for keyboard index selection
  const flatNavigableItems = useMemo(() => {
    const items: Array<{
      type: 'personnel' | 'page';
      url: string;
      data: any;
    }> = [];

    // Add personnel items first when searching
    personnelResults.forEach((person) => {
      items.push({
        type: 'personnel',
        url: `/modules/personnel/directory?search=${encodeURIComponent(person.firstName)}`,
        data: person,
      });
    });

    // Add page/module items
    filteredPageItems.forEach((page) => {
      items.push({
        type: 'page',
        url: page.url,
        data: page,
      });
    });

    return items;
  }, [personnelResults, filteredPageItems]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatNavigableItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatNavigableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatNavigableItems.length) % flatNavigableItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatNavigableItems[selectedIndex];
      if (target) {
        handleSelect(target.url);
      }
    }
  };

  // Group filtered pages by section
  const groupedPageItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    filteredPageItems.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  }, [filteredPageItems]);

  return (
    <>
      {/* Mobile trigger button (< lg) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs transition-colors outline-none hover:bg-background-gray-primary lg:hidden"
        aria-label="Open search modal"
      >
        <SearchIcon />
      </button>

      {/* Desktop trigger bar (lg+) */}
      <div className="hidden lg:block w-full max-w-xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex w-full items-center rounded-lg border border-card-border bg-card-background px-3.5 py-2 text-left text-sm text-text-tertiary shadow-xs transition-all hover:border-border-secondary-alt hover:bg-background-gray-primary outline-none"
        >
          <span className="mr-2 text-icon-tertiary group-hover:text-text-primary transition-colors">
            <SearchIcon />
          </span>
          <span className="flex-1 select-none truncate text-text-tertiary text-xs sm:text-sm">
            ค้นหาหน้า, เมนู หรือ บุคลากร...
          </span>
          <div className="flex items-center gap-0.5 rounded-md border border-card-border bg-background-gray-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Command Search Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div
            className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-card-border bg-card-surface-area text-text-primary shadow-2xl animate-fade-in"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-card-border px-4 py-3.5 bg-card-surface-area">
              <span className="mr-3 text-icon-tertiary">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="พิมพ์ชื่อบุคคลากร, เลขประจำตัว, หน้า หรือเมนูระบบ..."
                className="w-full min-w-0 flex-1 border-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-0 focus:outline-none"
              />
              {isSearchingPersonnel && (
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-card-border bg-background-gray-primary/80 px-2 py-0.75 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="scrollbar-thin max-h-[28rem] overflow-y-auto p-2 divide-y divide-card-border/50">
              {flatNavigableItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-tertiary">
                  <i className="fa-solid fa-magnifying-glass text-2xl mb-2 opacity-30"></i>
                  <p>ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา "{query}"</p>
                </div>
              ) : (
                <>
                  {/* PERSONNEL SECTION */}
                  {personnelResults.length > 0 && (
                    <div className="py-2">
                      <div className="flex items-center justify-between px-3 py-1.5">
                        <p className="text-[11px] font-semibold tracking-wider text-brand-600 dark:text-brand-400 uppercase flex items-center gap-1.5">
                          <i className="fa-solid fa-users text-xs"></i>
                          <span>กำลังพล / บุคลากร ({personnelResults.length})</span>
                        </p>
                        <span className="text-[10px] text-text-tertiary">กดเพื่อดูทำเนียบบุคลากร</span>
                      </div>

                      <div className="space-y-1 mt-1">
                        {personnelResults.map((person) => {
                          const itemIndex = flatNavigableItems.findIndex(
                            (it) => it.type === 'personnel' && it.data.id === person.id,
                          );
                          const isSelected = itemIndex === selectedIndex;
                          const fullName = `${person.rank ? person.rank + ' ' : ''}${person.firstName} ${person.lastName}`;
                          const url = `/modules/personnel/directory?search=${encodeURIComponent(person.firstName)}`;

                          return (
                            <div
                              key={`person-${person.id}`}
                              onClick={() => handleSelect(url)}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={cn(
                                'flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-all',
                                isSelected
                                  ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary ring-1 ring-brand-500/30'
                                  : 'text-text-secondary hover:bg-background-gray-primary',
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {person.avatarUrl ? (
                                  <img
                                    src={person.avatarUrl}
                                    alt={fullName}
                                    className="size-9 rounded-full object-cover ring-1 ring-card-border shrink-0"
                                  />
                                ) : (
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs ring-1 ring-card-border">
                                    <i className="fa-solid fa-user text-sm" />
                                  </div>
                                )}

                                <div className="min-w-0 truncate">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-semibold text-text-primary truncate">{fullName}</span>
                                    {person.badgeNo && (
                                      <span className="rounded bg-background-gray-primary px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                                        #{person.badgeNo}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-text-tertiary truncate flex items-center gap-1.5 mt-0.5">
                                    <span>{person.position || 'ไม่ระบุตำแหน่ง'}</span>
                                    <span>•</span>
                                    <span className="truncate">{person.department}{person.subDepartment ? ` (${person.subDepartment})` : ''}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2 pl-2">
                                {person.status && (
                                  <span className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                                    person.status === 'ปฏิบัติงานปกติ'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  )}>
                                    {person.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PAGES & MODULES SECTION */}
                  {filteredPageItems.length > 0 && (
                    <div className="py-2">
                      {Object.entries(groupedPageItems).map(([sectionLabel, sectionItems]) => (
                        <div key={sectionLabel} className="py-1">
                          <p className="px-3 py-1 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                            {sectionLabel}
                          </p>

                          <div className="space-y-0.5">
                            {sectionItems.map((item) => {
                              const itemIndex = flatNavigableItems.findIndex(
                                (it) => it.type === 'page' && it.data.id === item.id,
                              );
                              const isSelected = itemIndex === selectedIndex;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelect(item.url)}
                                  onMouseEnter={() => setSelectedIndex(itemIndex)}
                                  className={cn(
                                    'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                    isSelected
                                      ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary font-medium ring-1 ring-card-border'
                                      : 'text-text-secondary hover:bg-background-gray-primary',
                                  )}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span
                                      className={cn(
                                        'flex size-5 shrink-0 items-center justify-center text-sm',
                                        isSelected ? 'text-brand-500' : 'text-icon-secondary',
                                      )}
                                    >
                                      <i className={item.icon || 'fa-solid fa-circle-dot'} />
                                    </span>

                                    <div className="flex items-center gap-1.5 truncate">
                                      {item.parentTitle && (
                                        <span className="truncate font-normal text-text-tertiary">
                                          {item.parentTitle} /
                                        </span>
                                      )}
                                      <span className="truncate">{item.title}</span>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className="hidden text-xs text-text-tertiary sm:inline font-mono">
                                      {item.url}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer with navigation shortcuts */}
            <div className="flex items-center justify-between border-t border-card-border bg-background-gray-primary/40 px-4 py-2.5 text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-card-border bg-card-background px-1 py-0.5 font-mono text-[10px] shadow-xs">↑</kbd>
                  <kbd className="rounded border border-card-border bg-card-background px-1 py-0.5 font-mono text-[10px] shadow-xs">↓</kbd>
                  <span>นำทาง</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-card-border bg-card-background px-1.5 py-0.5 font-mono text-[10px] shadow-xs">↵</kbd>
                  <span>เลือกเปิด</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="rounded border border-card-border bg-card-background px-1.5 py-0.5 font-mono text-[10px] shadow-xs">ESC</kbd>
                <span>ปิด</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
