import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { convertToGreyscale } from '../../../common/utils/greyscale';

@Injectable()
export class HistogramEqualizationService {
  private readonly logger = new Logger(HistogramEqualizationService.name);
  @MessagePattern({ cmd: 'histogram_equalization' })
  async equalizeHistogram(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/enhancement/output_images');
      const outputFileName = `histogram_equalized_${path.basename(imagePath)}`;
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Convert to greyscale and validate
      const { buffer: raw, width, height } = await convertToGreyscale(imagePath);

      if (!width || !height || width <= 0 || height <= 0) {
        throw new Error('Invalid image dimensions');
      }

      if (raw.length !== width * height) {
        throw new Error('Invalid image data');
      }

      const histogram = new Array(256).fill(0);
      for (let i = 0; i < raw.length; i++) {
        const value = raw[i];
        histogram[value]++;
      }

      const cdf = new Array(256).fill(0);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }

      const totalPixels = raw.length;
      const L = 256;
      const scale = (L - 1) / totalPixels;

      const equalized = Buffer.alloc(raw.length);
      const PROGRESS_INTERVAL = 100000; // Report progress every 100k pixels
      let processedPixels = 0;

      for (let i = 0; i < raw.length; i++) {
        if (processedPixels % PROGRESS_INTERVAL === 0) {
          this.logger.log(`Processed ${processedPixels} pixels...`);
        }
        const originalIntensity = raw[i];
        const newIntensity = Math.round(cdf[originalIntensity] * scale);
        equalized[i] = Math.min(255, Math.max(0, newIntensity));
      }

      await sharp(equalized, {
        raw: {
          width: width!,
          height: height!,
          channels: 1,
        },
      })
        .png()
        .toFile(outputFilePath);

      // Calculate statistics
      const originalStats = this.calculateImageStats(raw);
      const equalizedStats = this.calculateImageStats(equalized);

      // Clean up temporary files
      const tempDir = path.dirname(imagePath);
      const tempFiles = await fs.promises.readdir(tempDir);
      for (const file of tempFiles) {
        if (file.startsWith('temp_')) {
          await fs.promises.unlink(path.join(tempDir, file));
        }
      }

      return {
        success: true,
        message: 'Histogram equalization complete',
        savedImagePath: outputFilePath,
        statistics: {
          original: originalStats,
          equalized: equalizedStats,
          pixelsProcessed: raw.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private calculateImageStats(imageData: Buffer): {
    min: number;
    max: number;
    mean: number;
    stdDev: number;
  } {
    if (!imageData || imageData.length === 0) {
      throw new Error('Invalid image data');
    }

    let min = 255;
    let max = 0;
    let sum = 0;
    let sumOfSquares = 0;

    for (const pixel of imageData) {
      if (pixel < min) min = pixel;
      if (pixel > max) max = pixel;
      sum += pixel;
      sumOfSquares += pixel * pixel;
    }

    const mean = sum / imageData.length;
    const variance = (sumOfSquares / imageData.length) - (mean * mean);
    const stdDev = Math.sqrt(variance);

    return {
      min,
      max,
      mean,
      stdDev
    };
  }
}
