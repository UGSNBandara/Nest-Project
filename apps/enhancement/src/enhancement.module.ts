/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EnhancementController } from './enhancement.controller';
import { EnhancementService } from './enhancement.service';
import { HistogramEqualizationService } from './services/histrogramEqualization.service';
import { FloodFillService } from './services/floodfill.service';

@Module({
  imports: [],
  controllers: [EnhancementController],
  providers: [
    EnhancementService,
    HistogramEqualizationService,
    FloodFillService,
  ],
})
export class EnhancementModule {}
