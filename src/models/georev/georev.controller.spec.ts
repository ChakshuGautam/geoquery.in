import { Test, TestingModule } from '@nestjs/testing';
import { GeorevController } from './georev.controller';

describe('GeorevController', () => {
  let controller: GeorevController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeorevController],
    }).compile();

    controller = module.get<GeorevController>(GeorevController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
