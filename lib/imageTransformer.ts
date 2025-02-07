import sharp from 'sharp';

export async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    console.log('Processing image with Sharp. Input buffer size:', buffer.length);
    const result = await sharp(buffer)
      .rotate()
      .webp({ quality: 70 })
      .toBuffer();
    console.log('Sharp processing successful. Output buffer size:', result.length);
    return result;
  } catch (error: unknown) {
    console.error('Sharp processing error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : '');
    throw new Error('Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export function isImage(fileName: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff)$/i;
  return imageExtensions.test(fileName);
} 