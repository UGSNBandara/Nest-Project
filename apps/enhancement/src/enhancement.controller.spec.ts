/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { EnhancementController } from './enhancement.controller';
import { EnhancementService } from './enhancement.service';

describe('EnhancementController', () => {
  
  let enhancementController: EnhancementController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EnhancementController],
      providers: [EnhancementService],
    }).compile();

    enhancementController = app.get<EnhancementController>(EnhancementController);
  });
});
