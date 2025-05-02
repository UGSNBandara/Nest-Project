/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BasicProcessingController } from './basic-processing.controller';
import { BasicProcessingService } from './basic-processing.service';
import { ResizeService } from './services/resize';
import { GreyscaleService } from './services/greyscale';
import { ContrastService } from './services/contrast';
import { NegativeService } from './services/negative';
import { SharpenService } from './services/sharpen';
import { EmbossService } from './services/embossing';
import { RotateService } from './services/rotate';

@Module({
  imports: [],
  controllers: [BasicProcessingController],
  providers: [
    BasicProcessingService,
    ResizeService,
    GreyscaleService,
    ContrastService,
    NegativeService,
    SharpenService,
    EmbossService,
    RotateService,
  ],
})
export class BasicProcessingModule { }
