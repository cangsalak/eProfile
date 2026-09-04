'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Personnel } from '@/types/personnel';
import { AltArrowDownIcon } from '@/utils/icon';
import { UserCircleIcon, GearIcon, LogoutIcon } from './icons';
import { cn } from '@/utils/cn';

interface ProfileDropdownProps {
  currentUser: Personnel;
  handleLogout: () => void;
}

export default function ProfileDropdown({ currentUser, handleLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = `${currentUser.prefix || ''}${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 rounded-lg border-0 p-0 transition-all outline-none focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="size-10 rounded-lg overflow-hidden border border-border-secondary-alt bg-background-gray-secondary_alt flex items-center justify-center shrink-0">
          {currentUser.avatarColor?.startsWith('data:image') || currentUser.avatarColor?.startsWith('http') ? (
            <img src={currentUser.avatarColor} alt={fullName} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
              {currentUser.firstName?.[0] || 'U'}
            </div>
          )}
        </div>

        <span className="text-sm leading-5 font-medium text-text-primary hidden sm:inline">
          {fullName}
        </span>

        <AltArrowDownIcon
          className={cn(
            'text-icon-tertiary transition-transform duration-200',
            isOpen && '-rotate-180',
          )}
        />
      </button>

      {/* Dropdown Menu (NextAdmin style) */}
      <div
        className={cn(
          'absolute right-0 mt-3 w-70 overflow-hidden rounded-2xl border border-card-border bg-card-surface-area p-0 shadow-3xl transition-all duration-200 origin-top-right z-50',
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
        )}
      >
        <div className="flex w-full items-center justify-start gap-3 border-b border-border-secondary-alt px-4 py-3 bg-card-surface-area">
          <div className="size-10 rounded-lg overflow-hidden border border-border-secondary-alt shrink-0">
            {currentUser.avatarColor?.startsWith('data:image') || currentUser.avatarColor?.startsWith('http') ? (
              <img src={currentUser.avatarColor} alt={fullName} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
                {currentUser.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-text-primary truncate">{fullName}</span>
            <span className="truncate text-xs text-text-tertiary">{currentUser.email || currentUser.badgeNo || currentUser.position || 'Member'}</span>
          </div>
        </div>
        
        <div className="p-1.5 space-y-0.5">
          <Link 
            href="/profile" 
            onClick={() => setIsOpen(false)} 
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-background-gray-primary hover:text-text-primary transition-colors group"
          >
            <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
              <UserCircleIcon />
            </span>
            <span className="leading-5 font-medium">View Profile</span>
          </Link>

          <Link 
            href="/settings" 
            onClick={() => setIsOpen(false)} 
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-background-gray-primary hover:text-text-primary transition-colors group"
          >
            <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
              <GearIcon />
            </span>
            <span className="leading-5 font-medium">Account Settings</span>
          </Link>

          <div className="my-1 border-t border-card-border" />

          <button 
            type="button" 
            onClick={() => { setIsOpen(false); handleLogout(); }} 
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors group"
          >
            <span className="shrink-0 text-rose-500">
              <LogoutIcon />
            </span>
            <span className="leading-5 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
