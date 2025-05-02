import { Test, TestingModule } from '@nestjs/testing';
import { BasicProcessingController, EnhancementController, FeatureDetectionController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let basicProcessingController: BasicProcessingController;
  let enhancementController: EnhancementController;
  let featureDetectionController: FeatureDetectionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BasicProcessingController, EnhancementController, FeatureDetectionController],
      providers: [AppService],
    }).compile();

    basicProcessingController = app.get<BasicProcessingController>(BasicProcessingController);
    enhancementController = app.get<EnhancementController>(EnhancementController);
    featureDetectionController = app.get<FeatureDetectionController>(FeatureDetectionController);
  });
});
