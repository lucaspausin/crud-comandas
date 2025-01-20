import { Test, TestingModule } from '@nestjs/testing';
import { SupportImagesController } from './support_images.controller';
import { SupportImagesService } from './support_images.service';

describe('SupportImagesController', () => {
  let controller: SupportImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportImagesController],
      providers: [SupportImagesService],
    }).compile();

    controller = module.get<SupportImagesController>(SupportImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
