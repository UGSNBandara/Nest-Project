/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { convertToGreyscale } from '../../../common/utils/greyscale';

@Injectable()
export class GreyscaleService {
  async saveGreyscaleImage(
    imagePath: string,
    filename: string = 'greyscale_image.png'
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const result = await convertToGreyscale(imagePath);

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFilename = filename.endsWith('.png') ? `${filename}.jpg` : filename;
      const outputPath = path.join(outputDir, outputFilename);

      await sharp(result.buffer, {
        raw: {
          width: result.height,
          height: result.width,
          channels: 3
        }
      })
        .png()
        .toFile(outputPath);

      return {
        success: true,
        filePath: outputPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}