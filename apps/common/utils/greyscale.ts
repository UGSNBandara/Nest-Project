import * as sharp from 'sharp';

export async function convertToGreyscale(imagePath: string): Promise<{ buffer: Buffer, width: number, height: number }> {
  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });

  const greyscaleBuffer = Buffer.alloc(info.width * info.height);

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    greyscaleBuffer[Math.floor(i / info.channels)] = y;
  }

  return {
    buffer: greyscaleBuffer,
    width: info.width,
    height: info.height
  };
}