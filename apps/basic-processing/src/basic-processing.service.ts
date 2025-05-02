/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ResizeService } from './services/resize';
import { GreyscaleService } from './services/greyscale';
import { ContrastService } from './services/contrast';
import { NegativeService } from './services/negative';
import { SharpenService } from './services/sharpen';
import { EmbossService } from './services/embossing';
import { RotateService } from './services/rotate';

@Injectable()
export class BasicProcessingService {
  constructor(
    private readonly resizeService: ResizeService,
    private readonly greyscaleService: GreyscaleService,
    private readonly contrastService: ContrastService,
    private readonly negativeService: NegativeService,
    private readonly sharpenService: SharpenService,
    private readonly embossService: EmbossService,
    private readonly rotateService: RotateService,
  ) { }

  async resizeImage(data: { imagePath: string; width: number; height: number }) {
    const result = await this.resizeService.resize(data);
    if (result.success) {
      return { success: true, message: 'Image resized successfully', data: result.savedImagePath };
    }
    else {
      return { success: false, message: 'Failed to resize image', error: result.error };
    }
  }

  async convertToGreyscale(imagePath: string) {
    return this.greyscaleService.saveGreyscaleImage(imagePath);
  }

  async createNegative(imagePath: string) {
    return await this.negativeService.createNegative(imagePath);
  }

  async adjustContrast(data: { imagePath: string; contrast: number }) {
    return await this.contrastService.adjust(data);
  }

  async rotateImage(data: { imagePath: string; angle: number }) {
    return await this.rotateService.rotate(data);
  }

  async sharpenImage(imagePath: string) {
    return await this.sharpenService.sharpenImage(imagePath);
  }
  async embossImage(imagePath: string) {
    return await this.embossService.embossImage(imagePath);
  }
}