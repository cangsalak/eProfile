'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type PropsType = {
  items: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  dividerType?: 'slash' | 'chevron' | 'dot';
  activeHref?: string;
  className?: string;
};

export function Breadcrumbs({
  items,
  className,
  dividerType = 'chevron',
}: PropsType) {
  return (
    <ol
      className={cn(
        'flex items-center gap-2',
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index + 1 === items.length;

        return (
          <li
            key={`${item.href}-${index}`}
            className="flex items-center gap-2 text-text-tertiary"
          >
            {index > 0 && <Divider type={dividerType} />}

            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors',
                isLast
                  ? 'text-text-primary pointer-events-none'
                  : 'text-text-tertiary hover:text-text-primary',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function Divider({ type }: { type: PropsType['dividerType'] }) {
  switch (type) {
    case 'chevron':
      return (
        <svg
          className="size-3.5 text-text-tertiary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      );

    case 'dot':
      return <span className="size-1 rounded-full bg-text-tertiary shrink-0" />;

    default:
      return <span className="text-text-tertiary shrink-0">/</span>;
  }
}
