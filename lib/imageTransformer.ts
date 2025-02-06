import sharp from 'sharp';

export async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF data
      .webp({ quality: 80 }) // Adjust quality as needed (0-100)
      .toBuffer();
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    throw error;
  }
}

export function isImage(fileName: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i;
  return imageExtensions.test(fileName);
} 