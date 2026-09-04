'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
  const filteredItems = useMemo(() => {
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

  // Group filtered items by section
  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredItems[selectedIndex];
      if (target) {
        handleSelect(target.url);
      }
    }
  };

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
            Search pages & modules...
          </span>
          <div className="flex items-center gap-0.5 rounded-md border border-card-border bg-background-gray-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Command Search Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div
            className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-card-border bg-card-surface-area text-text-primary shadow-2xl animate-fade-in"
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
                placeholder="ค้นหาหน้า, เมนู หรือโมดูล (พิมพ์ชื่อภาษาไทย หรือภาษาอังกฤษ)..."
                className="w-full min-w-0 flex-1 border-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-card-border bg-background-gray-primary/80 px-2 py-0.75 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="scrollbar-thin max-h-96 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-tertiary">
                  <i className="fa-solid fa-magnifying-glass text-2xl mb-2 opacity-30"></i>
                  <p>ไม่พบหน้าที่ตรงกับคำค้นหา "{query}"</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([sectionLabel, sectionItems]) => (
                  <div key={sectionLabel} className="py-1.5">
                    <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                      {sectionLabel}
                    </p>

                    <div className="space-y-0.5">
                      {sectionItems.map((item) => {
                        const globalIndex = filteredItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item.url)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                              isSelected
                                ? 'bg-sidebar-navigation-nav-item-nav-hover-background text-text-primary font-medium'
                                : 'text-text-secondary hover:bg-background-gray-primary',
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className={cn('flex size-5 shrink-0 items-center justify-center text-base', isSelected ? 'text-brand-500' : 'text-icon-secondary')}>
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
                ))
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
