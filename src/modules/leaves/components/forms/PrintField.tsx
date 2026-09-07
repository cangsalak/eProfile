import React from 'react';

export const Field = ({
  width = '100px',
  className = '',
  children,
  align = 'left',
}: {
  width?: string;
  className?: string;
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}) => (
  <span
    className={`inline-block border-b border-dotted border-black text-black leading-none whitespace-nowrap overflow-visible px-1 ${className}`}
    style={{
      width: width === 'auto' ? undefined : width,
      minWidth: width === 'auto' ? '20px' : width,
      textAlign: align,
      fontSize: 'inherit',
      verticalAlign: 'baseline',
    }}
  >
    {children !== undefined && children !== null && children !== '' ? children : '\u00A0'}
  </span>
);
