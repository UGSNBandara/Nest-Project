import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FloodFillService {
  private readonly logger = new Logger(FloodFillService.name);

  @MessagePattern({ cmd: 'flood_fill' })
  async floodFill(
    @Payload()
    data: {
      imagePath: string;
      sr: number;
      sc: number;
      newColor: [number, number, number];
      tolerance?: number; // Do not change the tolerance value(It is defined as 0 in the below code)
    },
  ) {
    const { imagePath, sr, sc, newColor, tolerance = 0 } = data;

    // Validate input parameters
    if (tolerance < 0) {
      throw new Error('Tolerance must be non-negative');
    }

    // Validate color values
    if (newColor.some(c => c < 0 || c > 255)) {
      throw new Error('Color values must be between 0 and 255');
    }

    if (!fs.existsSync(imagePath)) {
      this.logger.error(`Image not found at path: ${imagePath}`);
      throw new Error('Image file not found');
    }

    const outputDir = path.join(process.cwd(), 'apps/enhancement/output_images');
    const outputFileName = `flood_filled_${path.basename(imagePath)}`;
    const outputPath = path.join(outputDir, outputFileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      if (!width || !height) {
        throw new Error('Could not determine image dimensions');
      }

      const { data: rawBuffer, info } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { channels } = info;

      const outputBuffer = Buffer.from(rawBuffer);

      const getIndex = (x: number, y: number) => (y * width + x) * channels;

      const getColor = (buffer: Buffer, x: number, y: number): number[] => {
        const i = getIndex(x, y);
        const color: number[] = [];
        for (let c = 0; c < channels; c++) {
          color.push(buffer[i + c]);
        }
        return color;
      };

      const setColor = (buffer: Buffer, x: number, y: number, color: number[]) => {
        const i = getIndex(x, y);
        for (let c = 0; c < channels; c++) {
          buffer[i + c] = color[c];
        }
      };

      const isWithinTolerance = (a: number[], b: number[]): boolean => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          if (Math.abs(a[i] - b[i]) > tolerance) {
            return false;
          }
        }
        return true;
      };

      if (sc < 0 || sc >= width || sr < 0 || sr >= height) {
        throw new Error(`Starting coordinates (${sc},${sr}) out of image bounds (${width}x${height})`);
      }

      const originalColor = getColor(rawBuffer, sc, sr);
      const newColorArray = newColor.slice(0, channels);

      if (isWithinTolerance(originalColor, newColorArray) && tolerance === 0) {
        return {
          message: 'Original and new color are the same. Nothing changed.',
          outputPath
        };
      }

      // Add timeout for large regions
      const startTime = Date.now();
      const MAX_PROCESSING_TIME = 30000; // 30 seconds

      const queue: [number, number][] = [[sc, sr]];
      const visited = new Set<string>();
      const MAX_QUEUE_SIZE = 1000000; // Prevent memory overflow

      const dx = [1, -1, 0, 0];
      const dy = [0, 0, 1, -1];

      let pixelsFilled = 0;
      let processedPixels = 0;
      const PROGRESS_INTERVAL = 100000; // Report progress every 100k pixels

      while (queue.length > 0) {
        // Check for timeout
        if (Date.now() - startTime > MAX_PROCESSING_TIME) {
          throw new Error('Processing took too long. Operation aborted.');
        }

        // Check queue size to prevent memory overflow
        if (queue.length > MAX_QUEUE_SIZE) {
          throw new Error('Region too large. Operation aborted.');
        }

        if (processedPixels % PROGRESS_INTERVAL === 0) {
          this.logger.log(`Processed ${processedPixels} pixels...`);
        }
        const [x, y] = queue.shift()!;
        const pos = `${x},${y}`;

        if (visited.has(pos)) continue;
        visited.add(pos);

        const currentColor = getColor(rawBuffer, x, y);
        if (!isWithinTolerance(currentColor, originalColor)) continue;

        setColor(outputBuffer, x, y, newColorArray);
        pixelsFilled++;

        for (let i = 0; i < 4; i++) {
          const newX = x + dx[i];
          const newY = y + dy[i];

          if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            queue.push([newX, newY]);
          }
        }
      }

      // Clean up temporary files
      try {
        await sharp(outputBuffer, {
          raw: { width, height, channels },
        })
          .toFile(outputPath);

        // Clean up any temporary files
        const tempDir = path.dirname(imagePath);
        const tempFiles = await fs.promises.readdir(tempDir);
        for (const file of tempFiles) {
          if (file.startsWith('temp_')) {
            await fs.promises.unlink(path.join(tempDir, file));
          }
        }
      } catch (error) {
        this.logger.error(`Error saving image: ${error.message}`);
        throw error;
      }

      return {
        message: `Flood fill applied successfully. ${pixelsFilled} pixels changed.`,
        outputPath,
        pixelsFilled,
      };
    } catch (error) {
      this.logger.error(`Error applying flood fill: ${error.message}`);
      throw error;
    }
  }
}