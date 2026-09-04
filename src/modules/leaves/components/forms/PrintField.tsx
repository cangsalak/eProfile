import React from 'react';

export const Field = ({ width = '100px', className = '', children }: { width?: string, className?: string, children?: React.ReactNode }) => (
  <span
    className={`inline-block border-b border-dotted border-black text-left text-black leading-none whitespace-nowrap overflow-visible ${className}`}
    style={{ width: width === 'auto' ? undefined : width }}
  >
    {children || '\u00A0'}
  </span>
);
