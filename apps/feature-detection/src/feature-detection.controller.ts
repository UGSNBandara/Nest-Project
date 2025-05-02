/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { FeatureDetectionService } from './feature-detection.service';

@Controller()
export class FeatureDetectionController {
  constructor(private readonly featureDetectionService: FeatureDetectionService) { }

  @EventPattern({ cmd: 'canny_edge_detection_image' })
  async handleCannyEdgeDetection(imagePath: string) {
    console.log('Received image for canny edge detection');
    return await this.featureDetectionService.cannyEdgeDetection(imagePath);
  }

  @EventPattern({ cmd: 'harris_corner_detection_image' })
  async handleHarrisSharp(data: { imagePath: string; k?: number; windowSize?: number; thresh?: number }) {
    console.log('Received image for Harris corner detection');
    return await this.featureDetectionService.detectCorners(data.imagePath, data.k, data.windowSize, data.thresh);
  }
}
