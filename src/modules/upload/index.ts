import { ModuleDefinition } from '@/modules/core/types';
import { UploadManifest } from './manifest';
import UploadGalleryView from './views/UploadGalleryView';
import StorageSettingsView from './views/StorageSettingsView';

export * from './manifest';
export * from './lib/file-utils';
export * from './lib/client-upload';

export { default as UploadGalleryView } from './views/UploadGalleryView';
export { default as StorageSettingsView } from './views/StorageSettingsView';
export { default as UploadDropzone } from './components/UploadDropzone';
export { default as MediaGallery } from './components/MediaGallery';
export { default as S3ConfigForm } from './components/S3ConfigForm';
export { default as MediaPickerModal } from './components/MediaPickerModal';
export { default as FileDetailsModal } from './components/FileDetailsModal';
export { default as ImageUpload } from './components/ImageUpload';
export { default as FileUpload } from './components/FileUpload';
export { WebcamCaptureModal } from './components/WebcamCaptureModal';
export type { ImageUploadProps, ImageUploadVariant } from './components/ImageUpload';
export type { FileUploadProps } from './components/FileUpload';
export type { WebcamCaptureModalProps, CompositionGuideType } from './components/WebcamCaptureModal';

export const UploadModule: ModuleDefinition = {
  manifest: UploadManifest,
  views: {
    '': UploadGalleryView,
    'index': UploadGalleryView,
    'gallery': UploadGalleryView,
    'settings': StorageSettingsView,
    's3': StorageSettingsView,
  },
};
