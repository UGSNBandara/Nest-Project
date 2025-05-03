import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SharpenService {
  // Do not change the this kernel
  private readonly strongKernel = [
    [-1, -1, -1],
    [-1, 9, -1],
    [-1, -1, -1],
  ];

  
  private applyConvolution(
    imageData: Buffer,
    width: number,
    height: number,
    channels: number
  ): Buffer {
    const result = Buffer.alloc(imageData.length);
    const kernel = this.strongKernel;
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < channels; c++) {
          let sum = 0;
  
          // Apply the kernel
          for (let ky = -offset; ky <= offset; ky++) {
            for (let kx = -offset; kx <= offset; kx++) {
              const pixelX = Math.min(width - 1, Math.max(0, x + kx));
              const pixelY = Math.min(height - 1, Math.max(0, y + ky));
              const kernelValue = kernel[ky + offset][kx + offset];
  
              const pixelIndex = (pixelY * width + pixelX) * channels + c;
              sum += imageData[pixelIndex] * kernelValue;
            }
          }
  
          const pixelIndex = (y * width + x) * channels + c;
          result[pixelIndex] = Math.min(255, Math.max(0, Math.round(sum)));
        }
      }
    }
  
    return result;
  }

  @MessagePattern({ cmd: 'sharpen_image' })
  async sharpenImage(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFilePath = path.join(outputDir, 'sharpened_image.png');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height, channels = 3 } = metadata;

      const imageBuffer = await image.raw().toBuffer();

      const sharpened = this.applyConvolution(imageBuffer, width!, height!, channels);

      await sharp(sharpened, {
        raw: {
          width: width!,
          height: height!,
          channels,
        },
      })
        .png({ compressionLevel: 6 })
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Image sharpened without resizing',
        savedImagePath: outputFilePath,
      };
    } catch (error) {
      console.error('Sharpening failed:', error);
      return {
        success: false,
        message: 'Image sharpening failed',
        error: error.message,
      };
    }
  }
}