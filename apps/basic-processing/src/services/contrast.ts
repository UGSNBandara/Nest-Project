/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContrastService {
  private applyContrast(imageData: Buffer, width: number, height: number, channels: number, contrast: number): Buffer {
    const result = Buffer.alloc(imageData.length);

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < channels; c++) {
          const pixelIndex = (y * width + x) * channels + c;
          const pixel = imageData[pixelIndex];
          const newValue = factor * (pixel - 128) + 128;
          result[pixelIndex] = Math.min(255, Math.max(0, Math.round(newValue)));
        }
      }
    }
    return result;
  }

  @MessagePattern({ cmd: 'adjust_contrast' })
  async adjust(data: { imagePath: string; contrast: number }) {
    try {
      const { imagePath, contrast } = data;

      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFileName = `contrast_${contrast}_image.png`;
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height, channels = 3 } = metadata;

      const rawData = await image.raw().toBuffer();

      const contrastedBuffer = this.applyContrast(rawData, width!, height!, channels, contrast);

      // Save the contrasted image
      await sharp(contrastedBuffer, {
        raw: {
          width: width!,
          height: height!,
          channels: channels
        }
      })
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Contrast adjusted successfully',
        savedImagePath: outputFilePath,
      };
    } catch (error) {
      console.error('Contrast adjustment error:', error);
      return {
        success: false,
        message: 'Failed to adjust contrast',
        error: error.message,
      };
    }
  }
}
