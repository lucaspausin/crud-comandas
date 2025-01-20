import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesImagesController } from './vehicles_images.controller';
import { VehiclesImagesService } from './vehicles_images.service';

describe('VehiclesImagesController', () => {
  let controller: VehiclesImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesImagesController],
      providers: [VehiclesImagesService],
    }).compile();

    controller = module.get<VehiclesImagesController>(VehiclesImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
