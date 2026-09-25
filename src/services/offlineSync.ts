import { Listing } from '../types';

export interface CompressedImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  compressionRatioPercent: number;
}

/**
 * Client-Side Canvas Image Compressor
 * Downscales and encodes to image/webp at 0.75 quality to preserve bandwidth
 * in low-connectivity or high-cost mobile environments.
 */
export async function compressImageClientSide(
  file: File,
  maxDimension = 1200,
  quality = 0.75
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const originalBytes = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        // Approximate byte size from base64 string
        const head = 'data:image/webp;base64,';
        const base64Str = webpDataUrl.substring(head.length);
        const compressedBytes = Math.round((base64Str.length * 3) / 4);

        const ratio = Math.round((1 - compressedBytes / originalBytes) * 100);

        resolve({
          dataUrl: webpDataUrl,
          originalBytes,
          compressedBytes,
          compressionRatioPercent: Math.max(0, ratio),
        });
      };

      img.onerror = () => reject(new Error('Failed to load image for canvas compression'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const OFFLINE_DRAFTS_STORAGE_KEY = 'kijijishare_offline_drafts';

export function getOfflineDrafts(): Listing[] {
  try {
    const raw = localStorage.getItem(OFFLINE_DRAFTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineDraft(listing: Listing): void {
  const drafts = getOfflineDrafts();
  const existingIdx = drafts.findIndex(d => d.id === listing.id);
  if (existingIdx >= 0) {
    drafts[existingIdx] = listing;
  } else {
    drafts.push(listing);
  }
  localStorage.setItem(OFFLINE_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

export function removeOfflineDraft(id: string): void {
  const drafts = getOfflineDrafts().filter(d => d.id !== id);
  localStorage.setItem(OFFLINE_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}
