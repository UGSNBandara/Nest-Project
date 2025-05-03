/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NegativeService {
  @MessagePattern({ cmd: 'create_negative' })
  async createNegative(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFileName = 'negative_image.png';
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Load image with sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height, channels = 3 } = metadata;

      // Read raw image data
      const rawData = await image.raw().toBuffer();

      // Create buffer for negative effect
      const negativeBuffer = Buffer.alloc(rawData.length);
      
      // Process each pixel
      for (let i = 0; i < rawData.length; i += channels) {
        // Invert RGB channels
        negativeBuffer[i] = 255 - rawData[i];
        negativeBuffer[i + 1] = 255 - rawData[i + 1];
        negativeBuffer[i + 2] = 255 - rawData[i + 2];
        // Preserve alpha channel if present
        if (channels === 4) {
          negativeBuffer[i + 3] = rawData[i + 3];
        }
      }

      // Save the negative image
      await sharp(negativeBuffer, {
        raw: {
          width: width!,
          height: height!,
          channels: channels,
        },
      })
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Negative image created successfully',
        savedImagePath: outputFilePath,
      };
    } catch (error) {
      console.error('Negative image creation error:', error);
      return {
        success: false,
        message: 'Failed to process image',
        error: error.message,
      };
    }
  }
}
