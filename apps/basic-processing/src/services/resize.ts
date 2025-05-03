/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResizeService {
  @MessagePattern({ cmd: 'resize_image' })
  async resize(data: { imagePath: string; width: number; height: number }) {
    try {
      const { imagePath, width, height } = data;

      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFileName = 'resized_image.png';
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        await fs.promises.mkdir(outputDir, { recursive: true });
      }

      const inputImage = await fs.promises.readFile(imagePath);
      const { data: inputBuffer, info: inputInfo } = await sharp(inputImage).raw().toBuffer({ resolveWithObject: true });

      const resizedBuffer = this.bilinearInterpolation(inputBuffer, inputInfo.height, inputInfo.width, height, width, inputInfo.channels);

      // Save the resized image
      await sharp(resizedBuffer, {
        raw: {
          width: width,
          height: height,
          channels: inputInfo.channels,
        },
      })
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Image resized successfully',
        savedImagePath: outputFilePath,
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

 
  private bilinearInterpolation(
    inputBuffer: Buffer,
    inputHeight: number,
    inputWidth: number,
    outputHeight: number,
    outputWidth: number,
    channels: number
  ): Buffer {
    const outputBuffer = Buffer.alloc(outputWidth * outputHeight * channels);
    const xRatio = inputWidth / outputWidth;
    const yRatio = inputHeight / outputHeight;

    // Handle edge cases
    if (outputWidth === 0 || outputHeight === 0) {
      return Buffer.alloc(0);
    }

    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        // Calculate source coordinates
        const px = Math.floor(x * xRatio);
        const py = Math.floor(y * yRatio);
        const fx = x * xRatio - px;
        const fy = y * yRatio - py;

        // Handle edges by clamping to border pixels
        const px1 = Math.min(Math.max(px, 0), inputWidth - 2);
        const px2 = Math.min(Math.max(px + 1, 1), inputWidth - 1);
        const py1 = Math.min(Math.max(py, 0), inputHeight - 2);
        const py2 = Math.min(Math.max(py + 1, 1), inputHeight - 1);

        for (let c = 0; c < channels; c++) {
          const topLeft = inputBuffer[(py1 * inputWidth + px1) * channels + c];
          const topRight = inputBuffer[(py1 * inputWidth + px2) * channels + c];
          const bottomLeft = inputBuffer[(py2 * inputWidth + px1) * channels + c];
          const bottomRight = inputBuffer[(py2 * inputWidth + px2) * channels + c];

          const top = topLeft + fx * (topRight - topLeft);
          const bottom = bottomLeft + fx * (bottomRight - bottomLeft);
          const value = top + fy * (bottom - top);

          outputBuffer[(y * outputWidth + x) * channels + c] = Math.round(value);
        }
      }
    }

    return outputBuffer;
  }
  
}