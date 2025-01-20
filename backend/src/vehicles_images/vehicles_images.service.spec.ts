import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesImagesService } from './vehicles_images.service';

describe('VehiclesImagesService', () => {
  let service: VehiclesImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclesImagesService],
    }).compile();

    service = module.get<VehiclesImagesService>(VehiclesImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
