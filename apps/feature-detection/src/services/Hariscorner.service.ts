import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class HarrisSharpService {
  private readonly logger = new Logger(HarrisSharpService.name);

  @MessagePattern({ cmd: 'harris_corner' })
  async detectCorners(
    @Payload()
    data: {
      imagePath: string;
      k?: number;          // Harris free parameter (default 0.04)
      windowSize?: number; // Gaussian window size (default 3)
      thresh?: number;     // Response threshold (default 1e-5)
    },
  ) {
    const { imagePath, k = 0.04, windowSize = 3, thresh = 1e-5 } = data;
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image not found');
    }

    // Load & preprocess image
    const input = fs.readFileSync(imagePath);
    const { data: buf, info } = await sharp(input)
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info; // channels should be 1
    const img = Float32Array.from(buf).map(v => v / 255);

    // Helper to index (x,y) in flat array
    const idx = (x: number, y: number) => y * width + x;

    // Sobel kernels
    const Sx = [
      [2, 0, -2],
      [1, 0, -1],
      [2, 0, -2],
    ];
    const Sy = [
      [2, 1, 2],
      [0, 0, 0],
      [-2, -1, -2],
    ];

    // Convolution with proper boundary handling
    function convolve(kernel: number[][], img: Float32Array): Float32Array {
      const out = new Float32Array(width * height);
      const kHalf = Math.floor(kernel.length / 2);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0;
          for (let ky = -kHalf; ky <= kHalf; ky++) {
            for (let kx = -kHalf; kx <= kHalf; kx++) {
              const ix = x + kx;
              const iy = y + ky;
              if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                sum += kernel[ky + kHalf][kx + kHalf] * img[idx(ix, iy)];
              }
            }
          }
          out[idx(x, y)] = sum;
        }
      }
      return out;
    }

    // Compute gradients
    const dx = convolve(Sx, img);
    const dy = convolve(Sy, img);

    // Compute products and apply Gaussian blur (box blur for simplicity)
    const A = new Float32Array(width * height);
    const B = new Float32Array(width * height);
    const C = new Float32Array(width * height);
    for (let i = 0; i < A.length; i++) {
      A[i] = dx[i] * dx[i];
      B[i] = dy[i] * dy[i];
      C[i] = dx[i] * dy[i];
    }

    // Box blur with proper window handling
    function boxBlur(dataArr: Float32Array, w: number): Float32Array {
      const out = new Float32Array(width * height);
      const r = Math.floor(w / 2);
      const area = w * w;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0;
          let count = 0;
          for (let yy = -r; yy <= r; yy++) {
            for (let xx = -r; xx <= r; xx++) {
              const ix = x + xx;
              const iy = y + yy;
              if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                sum += dataArr[idx(ix, iy)];
                count++;
              }
            }
          }
          out[idx(x, y)] = sum / count;
        }
      }
      return out;
    }

    const Sxx = boxBlur(A, windowSize);
    const Syy = boxBlur(B, windowSize);
    const Sxy = boxBlur(C, windowSize);

    // Compute R and collect corners
    const R = new Float32Array(width * height);
    for (let i = 0; i < R.length; i++) {
      const det = Sxx[i] * Syy[i] - Sxy[i];
      const trace = Sxx[i] + Syy[i];
      R[i] = det - k * trace;
    }

    // Simple non‑max suppression + threshold
    const corners: { x: number; y: number; r: number }[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = idx(x, y);
        const val = R[i];
        if (val > thresh &&
          val > R[idx(x - 1, y)] ||
          val > R[idx(x + 1, y)] ||
          val > R[idx(x, y - 1)] ||
          val > R[idx(x, y + 1)]) {
          corners.push({ x, y, r: val });
        }
      }
    }

    // Draw on a PNG via raw buffer
    const outBuf = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const src = img[idx(x, y)] * 255;
        const dstIdx = (y * width + x) * 3;
        outBuf[dstIdx] = src;
        outBuf[dstIdx + 1] = src;
        outBuf[dstIdx + 2] = src;
      }
    }

    // Draw green circles at corners
    const circleRadius = 5;
    corners.forEach(pt => {
      for (let yy = -circleRadius; yy <= circleRadius; yy++) {
        for (let xx = -circleRadius; xx <= circleRadius; xx++) {
          const nx = pt.x + xx;
          const ny = pt.y + yy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const dist = Math.sqrt(xx * xx + yy * yy);
            if (dist <= circleRadius) {
              const d = (ny * width + nx) * 3;
              outBuf[d] = 0;      // Green channel
              outBuf[d + 1] = 255; // Max Green intensity
              outBuf[d + 2] = 0;   // No red or blue
            }
          }
        }
      }
    });

    const outputDir = path.join(process.cwd(), 'apps/feature-detection/output_images');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, `harris_sharp_${path.basename(imagePath)}`);
    await sharp(outBuf, { raw: { width, height, channels: 3 } })
      .png()
      .toFile(outPath);

    this.logger.log(`Detected ${corners.length} corners, saved to ${outPath}`);
    return { corners: corners.slice(0, 20), outputPath: outPath };
  }
}
