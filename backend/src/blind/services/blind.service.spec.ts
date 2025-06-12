import { Test, TestingModule } from '@nestjs/testing';
import { BlindService } from './blind.service';

describe('BlindService', () => {
  let service: BlindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlindService],
    }).compile();

    service = module.get<BlindService>(BlindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
