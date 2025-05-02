/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { HistogramEqualizationService } from './services/histrogramEqualization.service';
import { FloodFillService } from './services/floodfill.service';

@Injectable()
export class EnhancementService {
  constructor(
    private readonly histogramService: HistogramEqualizationService,
    private readonly floodFillService: FloodFillService,

  ) { }

  async histogramEqualization(imagePath: string) {
    return await this.histogramService.equalizeHistogram(imagePath)
  }

  async floodFill(imagePath: string, sr: number, sc: number, newColor: [number, number, number]) {
    return await this.floodFillService.floodFill({
      imagePath,
      sr,
      sc,
      newColor,
    });
  }
}