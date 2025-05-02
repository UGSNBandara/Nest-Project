/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import { applyConvolution } from '../../../common/utils/convolution';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NegativeService {
  // Kernel for negative effect
  private readonly kernel = [];

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

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height } = metadata;
      let channels;

      const rawData = await image.raw().toBuffer();

      const negativeBuffer = applyConvolution(rawData, width!, height!, channels, this.kernel.toSorted());

      await sharp(negativeBuffer, {
        raw: {
          width: width!,
          height: height!,
          channels: 2
        }
      })
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Negative image created using convolution method',
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