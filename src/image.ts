export type Point = { x: number; y: number };
export type Transform = Point & { zoom: number };
export type Fit = { width: number; height: number };
export type Photo = { image: HTMLImageElement; url: string; fit: Fit };

export const INITIAL: Transform = { x: 0, y: 0, zoom: 1 };
export const OUTPUT_SIZE = 2048;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function fitImage(width: number, height: number): Fit {
  const shortEdge = Math.min(width, height);
  return { width: width / shortEdge, height: height / shortEdge };
}

export function clampTransform(value: Transform, fit: Fit): Transform {
  const zoom = clamp(value.zoom, 1, 10);
  const maxX = (fit.width * zoom - 1) / 2;
  const maxY = (fit.height * zoom - 1) / 2;
  return { x: clamp(value.x, -maxX, maxX), y: clamp(value.y, -maxY, maxY), zoom };
}

export function zoomAt(value: Transform, zoom: number, anchor: Point): Transform {
  const ratio = clamp(zoom, 1, 10) / value.zoom;
  return { x: anchor.x - (anchor.x - value.x) * ratio,
    y: anchor.y - (anchor.y - value.y) * ratio, zoom: clamp(zoom, 1, 10) };
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export async function readPhoto(file: File): Promise<Photo> {
  if (file.size > 30 * 1024 * 1024) throw new Error('Ảnh quá lớn. Bạn chọn ảnh dưới 30 MB nha.');
  if (!file.size) throw new Error('Ảnh trống hoặc bị lỗi. Bạn chọn ảnh khác nha.');
  if (file.type && !file.type.startsWith('image/')) throw new Error('Bạn chọn một file ảnh nha.');
  let url = URL.createObjectURL(file);
  let image: HTMLImageElement;
  try {
    try {
      image = await loadImage(url);
    } catch {
      if (!/\.(heic|heif)$/i.test(file.name) && !/heic|heif/.test(file.type)) throw new Error('decode');
      const { heicTo } = await import('heic-to/csp');
      const converted = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.95 });
      URL.revokeObjectURL(url);
      url = URL.createObjectURL(converted);
      image = await loadImage(url);
    }
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('decode');
    if (image.naturalWidth * image.naturalHeight > 100_000_000) {
      throw new Error('Ảnh có độ phân giải quá lớn. Bạn chọn ảnh nhỏ hơn nha.');
    }
    // Keep decoded memory bounded after initial decoding, including high-resolution phone photos.
    const maxEdge = Math.max(image.naturalWidth, image.naturalHeight);
    if (maxEdge > 4096) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * 4096 / maxEdge);
      canvas.height = Math.round(image.naturalHeight * 4096 / maxEdge);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('canvas');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await canvasBlob(canvas, 'image/png');
      URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      image = await loadImage(url);
      canvas.width = canvas.height = 0;
    }
    return { image, url, fit: fitImage(image.naturalWidth, image.naturalHeight) };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.startsWith('Ảnh')) throw error;
    throw new Error('Chưa đọc được ảnh này. Bạn thử ảnh JPG, PNG, WebP hoặc HEIC khác nha.');
  }
}

export function paint(canvas: HTMLCanvasElement, photo: Photo | null,
  frame: HTMLImageElement, transform: Transform) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Thiết bị chưa hỗ trợ xử lý ảnh. Bạn thử Chrome hoặc Safari nha.');
  const size = canvas.width;
  context.clearRect(0, 0, size, size);
  context.fillStyle = '#f3f7ff';
  context.fillRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  if (photo) {
    const width = photo.fit.width * transform.zoom * size;
    const height = photo.fit.height * transform.zoom * size;
    context.drawImage(photo.image, size / 2 - width / 2 + transform.x * size,
      size / 2 - height / 2 + transform.y * size, width, height);
  }
  context.drawImage(frame, 0, 0, size, size);
}

function canvasBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob);
    else reject(new Error('Chưa xuất được ảnh. Bạn thử lại nha.'));
  }, type));
}

export async function exportPhoto(photo: Photo, frame: HTMLImageElement, transform: Transform) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = OUTPUT_SIZE;
  try {
    paint(canvas, photo, frame, transform);
    return await canvasBlob(canvas, 'image/png');
  } finally {
    canvas.width = canvas.height = 0;
  }
}
