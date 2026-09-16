/**
 * Client Upload Helper — eProfile System
 * Uploads files (images, documents, media) to the unified upload API endpoint.
 */

export interface UploadedMediaResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  uploadedAt?: string;
  uploadedBy?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  folder?: string;
  customEndpoint?: string;
}

/**
 * Upload a single File object to the server storage.
 */
export async function uploadFileToServer(
  file: File,
  options: UploadOptions = {}
): Promise<{ success: boolean; data?: UploadedMediaResult; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = options.customEndpoint || '/api/modules/upload/upload';

    // Report starting progress
    if (options.onProgress) {
      options.onProgress(30);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (options.onProgress) {
      options.onProgress(85);
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      const errorMsg = json.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์';
      return { success: false, error: errorMsg };
    }

    if (options.onProgress) {
      options.onProgress(100);
    }

    const fileResult: UploadedMediaResult = json.file || (json.files && json.files[0]);

    if (!fileResult) {
      return { success: false, error: 'ไม่พบข้อมูลไฟล์ที่อัปโหลด' };
    }

    return { success: true, data: fileResult };
  } catch (err: any) {
    console.error('uploadFileToServer error:', err);
    return {
      success: false,
      error: err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์อัปโหลดได้',
    };
  }
}

/**
 * Convert a base64 DataURL (e.g. from Webcam) to a File object for upload.
 */
export function base64ToFile(base64Data: string, filename: string = 'capture.jpg'): File {
  const arr = base64Data.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
