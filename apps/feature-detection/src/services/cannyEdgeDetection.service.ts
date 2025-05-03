import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { MessagePattern } from '@nestjs/microservices';
import { convertToGreyscale } from '../../../common/utils/greyscale';
import { applyGaussianBlur } from './gaussianBlur';
import { computeSobelGradients } from './sobelGradients';
import { nonMaxSuppression } from './nonMaxSuppression';
import { doubleThreshold } from './doubleThreshold';
import { hysteresis } from './hysteresis';


@Injectable()
export class CannyEdgeDetectionService {
  @MessagePattern({ cmd: 'canny_edge_detection' })
  async detectEdges(imagePath: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('File does not exist');
      }

      // Validate image size
      const stats = await fs.promises.stat(imagePath);
      if (stats.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image file too large');
      }

      const outputDir = path.join(process.cwd(), 'apps/feature-detection/output_images');
      const outputFileName = `canny_edges_${Date.now()}_${path.basename(imagePath)}`;
      const outputFilePath = path.join(outputDir, outputFileName);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      // Convert to greyscale
      const { buffer: gray, width, height } = await convertToGreyscale(imagePath);

      // Calculate gradients
      const { magnitude, direction } = computeSobelGradients(gray, width!, height!);

      // Non-Max Suppression
      const thinEdges = nonMaxSuppression(magnitude, direction, width!, height!);

      // Double Threshold
      const { strongEdges, weakEdges } = doubleThreshold(thinEdges, width!, height!, 5, 25);

      // Save the final output
      try {
        await sharp(strongEdges, {
          raw: { width: width!, height: height!, channels: 1 },
        }).png().toFile(outputFilePath);

        // Clean up temporary files only from the output directory
        const tempFiles = await fs.promises.readdir(outputDir);
        for (const file of tempFiles) {
          if (file.startsWith('temp_') && file.endsWith('.png')) {
            await fs.promises.unlink(path.join(outputDir, file));
          }
        }

        return {
          success: true,
          message: 'Canny edge detection complete',
          savedImagePath: outputFilePath,
        };
      } catch (error) {
        throw new Error(`Error saving image: ${error.message}`);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
