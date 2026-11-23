export type ExportedPhoto = { url: string; file: File };

export function isIOSDevice(device: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> = navigator) {
  return /iphone|ipad|ipod/i.test(device.userAgent)
    || (device.platform === 'MacIntel' && device.maxTouchPoints > 1);
}

export function canSharePhoto(file: File) {
  try {
    return typeof navigator.share === 'function' && !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

export function createExportedPhoto(blob: Blob): ExportedPhoto {
  return {
    file: new File([blob], 'TDGFrame-50-ngay-than-toc.png', { type: 'image/png' }),
    url: URL.createObjectURL(blob),
  };
}
