/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('BASIC_PROCESSING_SERVICE') private basicProcessingClient: ClientProxy,
    @Inject('ENHANCEMENT_SERVICE') private enhancementClient: ClientProxy,
    @Inject('FEATURE_DETECTION_SERVICE') private featureDetectionClient: ClientProxy,
  ) { }


  sendToBasicProcessingResize(imagePath: string, width: number, height: number) {
    return this.basicProcessingClient.send(
      { cmd: 'resize_image' },
      { imagePath, width, height }
    );
  }

  sendToBasicProcessingGreyscale(imagePath: string) {
    return this.basicProcessingClient.send(
      { cmd: 'convert_greyscale' },
      { imagePath }
    );
  }


  sendToBasicProcessingNegative(imagePath: string) {
    return this.basicProcessingClient.send(
      { cmd: 'create_negative' },
      imagePath
    );
  }

  sendToBasicProcessingContrast(imagePath: string, contrast: number) {
    return this.basicProcessingClient.send(
      { cmd: 'adjust_contrast' },
      { imagePath, contrast }
    );
  }

  sendToBasicProcessingRotate(imagePath: string, angle: number) {
    return this.basicProcessingClient.send(
      { cmd: 'rotate_image' },
      { imagePath, angle }
    );
  }

  sendToBasicProcessingSharpen(imagePath: string) {
    return this.basicProcessingClient.send(
      { cmd: 'sharpen_image' },
      imagePath
    );
  }
  sendToBasicProcessingEmboss(imagePath: string) {
    return this.basicProcessingClient.send(
      { cmd: 'emboss_image' },
      imagePath
    );
  }

  sendToEnhancementHistogram(imagePath: string) {
    return this.enhancementClient.send(
      { cmd: 'histogram_equalization_image' },
      imagePath
    );
  }

  sendToEnhancementFloodFill(imagePath: string, sr: number, sc: number, newColor: [number, number, number]) {
    return this.enhancementClient.send(
      { cmd: 'flood_fill_image' },
      { imagePath, sr, sc, newColor }
    );
  }

  sendToFeatureDetectionCannyEdgeDetection(imagePath: string) {
    return this.featureDetectionClient.send(
      { cmd: 'canny_edge_detection_image' },
      imagePath
    );
  }

  sendToFeatureDetectionHarrisSharp(imagePath: string, k: number = 0.04, windowSize: number = 3, thresh: number = 1e-5) {
    return this.featureDetectionClient.send(
      { cmd: 'harris_corner_detection_image' },
      { imagePath, k, windowSize, thresh }
    );
  }









}


