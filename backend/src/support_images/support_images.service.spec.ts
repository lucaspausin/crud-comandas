import { Test, TestingModule } from '@nestjs/testing';
import { SupportImagesService } from './support_images.service';

describe('SupportImagesService', () => {
  let service: SupportImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportImagesService],
    }).compile();

    service = module.get<SupportImagesService>(SupportImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
