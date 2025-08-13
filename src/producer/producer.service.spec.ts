/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ProducerService } from './producer.service';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

jest.mock('amqplib');

describe('ProducerService', () => {
  let service: ProducerService;

  // Create mock functions for the channel and connection
  const mockChannel = {
    assertQueue: jest.fn(),
    sendToQueue: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RABBITMQ_URL') return 'amqp://test-host';
              if (key === 'RABBITMQ_XRAY_QUEUE') return 'xray-test-queue';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to RabbitMQ and create a channel on initialization', async () => {
      await service.onModuleInit();

      expect(amqplib.connect).toHaveBeenCalledWith('amqp://test-host');
      expect(mockConnection.createChannel).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendMessage', () => {
    it('should assert the queue and send a message with the correct payload', async () => {
      await service.onModuleInit();

      const payload = { deviceId: 'test-123', data: 'some-data' };
      await service.sendMessage(payload);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith('xray-test-queue', {
        durable: true,
      });

      expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);

      const expectedBuffer = Buffer.from(JSON.stringify(payload));
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'xray-test-queue',
        expectedBuffer,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the RabbitMQ connection when the module is destroyed', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });
  });
});
