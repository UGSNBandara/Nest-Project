/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { BasicProcessingController } from './basic-processing.controller';
import { BasicProcessingService } from './basic-processing.service';

describe('BasicProcessingController', () => {
  let basicProcessingController: BasicProcessingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BasicProcessingController],
      providers: [BasicProcessingService],
    }).compile();

    basicProcessingController = app.get<BasicProcessingController>(BasicProcessingController);
  });
});
