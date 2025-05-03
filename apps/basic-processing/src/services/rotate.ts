import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { MessagePattern } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RotateService {
  private calculateNewDimensions(width: number, height: number, angle: number): { newWidth: number; newHeight: number } {
    if (angle === 90 || angle === 270) {
      return { newWidth: height, newHeight: width };
    }
    
    const radian = (angle * Math.PI) / 180;
    const sin = Math.sin(radian);
    const cos = Math.cos(radian);
    
    const newWidth = Math.round(Math.abs(width * cos) + Math.abs(height * sin));
    const newHeight = Math.round(Math.abs(height * cos) + Math.abs(width * sin));
    
    return { newWidth, newHeight };
  }

  private rotatePixels(
    inputBuffer: Buffer,
    width: number,
    height: number,
    angle: number,
    channels: number
  ): Buffer {
    // Handle special cases for 90/180/270 degree rotations
    if (angle === 90 || angle === 270) {
      const newWidth = height;
      const newHeight = width;
      const outputBuffer = Buffer.alloc(newWidth * newHeight * channels);

      if (angle === 90) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            for (let c = 0; c < channels; c++) {
              const sourceIndex = (y * width + x) * channels + c;
              const targetIndex = ((newHeight - 1 - x) * newWidth + y) * channels + c;
              outputBuffer[targetIndex] = inputBuffer[sourceIndex];
            }
          }
        }
      } else {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            for (let c = 0; c < channels; c++) {
              const sourceIndex = (y * width + x) * channels + c;
              const targetIndex = (x * newWidth + (newHeight - 1 - y)) * channels + c;
              outputBuffer[targetIndex] = inputBuffer[sourceIndex];
            }
          }
        }
      }
      return outputBuffer;
    }

    // For other angles, use general rotation
    const radian = (angle * Math.PI) / 180;
    const sin = Math.sin(radian);
    const cos = Math.cos(radian);
    
    // Calculate new dimensions
    const newWidth = Math.round(Math.abs(width * cos) + Math.abs(height * sin));
    const newHeight = Math.round(Math.abs(height * cos) + Math.abs(width * sin));
    
    const outputBuffer = Buffer.alloc(newWidth * newHeight * channels);
    const centerX = newWidth / 2;
    const centerY = newHeight / 2;
    
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        // Calculate original coordinates
        const dx = x - centerX;
        const dy = y - centerY;
        
        const originalX = Math.round(dx * cos + dy * sin + width / 2);
        const originalY = Math.round(-dx * sin + dy * cos + height / 2);
        
        // Check if original coordinates are within bounds
        if (originalX >= 0 && originalX < width && originalY >= 0 && originalY < height) {
          for (let c = 0; c < channels; c++) {
            const sourceIndex = (originalY * width + originalX) * channels + c;
            const targetIndex = (y * newWidth + x) * channels + c;
            outputBuffer[targetIndex] = inputBuffer[sourceIndex];
          }
        }
      }
    }

    return outputBuffer;
  }

  @MessagePattern({ cmd: 'rotate_image' })
  async rotate(data: { imagePath: string; angle: number }) {
    try {
      const { imagePath, angle } = data;

      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      const outputDir = path.join(process.cwd(), 'apps/basic-processing/output_images');
      const outputFileName = `rotated_${angle}_image.png`;
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width, height, channels = 3 } = metadata;

      if (!width || !height) {
        throw new Error('Invalid image dimensions');
      }

      const rawData = await image.raw().toBuffer();

      const rotatedBuffer = this.rotatePixels(rawData, width, height, angle, channels);
      const { newWidth, newHeight } = this.calculateNewDimensions(width, height, angle);

      // Save the rotated image
      await sharp(rotatedBuffer,{
        raw: {
          width: newWidth,
          height: newHeight,
          channels,
      }})
        .png()
        .toFile(outputFilePath);

      return {
        success: true,
        message: 'Image rotated successfully',
        savedImagePath: outputFilePath,
      };
    } catch (error) {
      console.error('Rotation error:', error);
      return {
        success: false,
        message: 'Failed to rotate image',
        error: error.message,
      };
    }
  }
}
