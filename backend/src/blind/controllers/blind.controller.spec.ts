import { Test, TestingModule } from '@nestjs/testing';
import { BlindController } from './blind.controller';

describe('BlindController', () => {
  let controller: BlindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlindController],
    }).compile();

    controller = module.get<BlindController>(BlindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
