/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CannyEdgeDetectionService } from './services/cannyEdgeDetection.service';
import { HarrisSharpService } from './services/Hariscorner.service';

@Injectable()
export class FeatureDetectionService {
  constructor(
    private readonly cannyEdgeService: CannyEdgeDetectionService,
    private readonly harrisSharpService: HarrisSharpService
  ) { }

  async cannyEdgeDetection(imagePath: string) {
    return await this.cannyEdgeService.detectEdges(imagePath)
  }
  async detectCorners(imagePath: string, k: number = 0.04, windowSize: number = 3, thresh: number = 1e-5) {
    return await this.harrisSharpService.detectCorners({
      imagePath,
      k,
      windowSize,
      thresh,
    });
  }
}