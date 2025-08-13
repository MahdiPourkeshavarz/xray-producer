/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';

const mockProducerService = {
  sendMessage: jest.fn(),
};

describe('ProducerController', () => {
  let controller: ProducerController;
  let service: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
    service = module.get<ProducerService>(ProducerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should call producerService.sendMessage with the payload from the body', async () => {
      const payload = { data: 'test-payload' };

      await controller.sendMessage(payload);

      expect(service.sendMessage).toHaveBeenCalledWith(payload);
    });

    it('should return the correct confirmation message and the payload sent', async () => {
      const payload = { data: 'another-payload' };

      const response = await controller.sendMessage(payload);

      expect(response).toEqual({
        message: 'Payload has been sent to the queue.',
        payloadSent: payload,
      });
    });
  });
});
