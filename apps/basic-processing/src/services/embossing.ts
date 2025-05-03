import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmbossService {
  private readonly customKernel = [
      [+1,  0,  0,  0,  0],
      [ 0, +1,  0,  0,  0],
      [ 0,  0,  0,  0,  0],
      [ 0,  0,  0, -1,  0],
      [ 0,  0,  0,  0, -1]
    ];
    

  private applyKernel(
    imageData: Buffer,
    width: number,
    height: number,
    channels: number
  ): Buffer {
    const result = Buffer.alloc(imageData.length);
    const size = 5;
    const offset = Math.floor(size / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < channels; c++) {
          let sum = 0;

          for (let ky = -offset; ky <= offset; ky++) {
            for (let kx = -offset; kx <= offset; kx++) {
              const px = Math.max(0, Math.min(x + kx, width - 1));
              const py = Math.max(0, Math.min(y + ky, height - 1));
              const weight = this.customKernel[ky + offset][kx + offset];
              const sourceIndex = (py * width + px) * channels + c;
              sum += imageData[sourceIndex] * weight;
            }
          }

          const index = (y * width + x) * channels + c;
          result[index] = Math.min(255, Math.max(0, Math.round(sum + 128))); // offset 128 for emboss look
        }
      }
    }

    return result;
  }

  @MessagePattern({ cmd: 'emboss_image' })
  async embossImage(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFile = path.join(outputDir, 'emboss_image.png');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height, channels = 3 } = metadata;
      const imageBuffer = await image.raw().toBuffer();

      const filtered = this.applyKernel(imageBuffer, width!, height!, channels);

      await sharp(filtered, {
        raw: {
          width: width!,
          height: height!,
          channels,
        },
      })
        .png()
        .toFile(outputFile);

      return {
        success: true,
        message: 'Image embossed successfully',
        savedImagePath: outputFile,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to apply filter',
        error: err.message,
      };
    }
  }
}
