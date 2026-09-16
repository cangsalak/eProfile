'use client';

import React from 'react';
import ImageUpload from '@/modules/upload/components/ImageUpload';

interface ImageUploadBoxProps {
  label: string;
  imageUrl?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  variant?: 'avatar' | 'square' | 'id-photo' | 'map' | 'landscape' | 'auto';
}

/**
 * ImageUploadBox (Backward-compatibility wrapper over unified ImageUpload)
 */
export default function ImageUploadBox({
  label,
  imageUrl,
  onChange,
  onRemove,
  variant = 'square',
}: ImageUploadBoxProps) {
  return (
    <ImageUpload
      label={label}
      value={imageUrl}
      onChange={(url) => onChange(url)}
      onRemove={onRemove}
      variant={variant}
    />
  );
}
