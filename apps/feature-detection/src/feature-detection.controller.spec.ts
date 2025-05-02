/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureDetectionController } from './feature-detection.controller';
import { FeatureDetectionService } from './feature-detection.service';

describe('FeatureDetectionController', () => {
  
  let featureDetectionController: FeatureDetectionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FeatureDetectionController],
      providers: [FeatureDetectionService],
    }).compile();

    featureDetectionController = app.get<FeatureDetectionController>(FeatureDetectionController);
  });
});
