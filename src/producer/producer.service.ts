/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common/interfaces';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    this.connection = await connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async sendMessage(payload: any) {
    const queueName = this.configService.get<string>('RABBITMQ_XRAY_QUEUE');

    await this.channel.assertQueue(queueName, { durable: true });

    const message = Buffer.from(JSON.stringify(payload));

    this.channel.sendToQueue(queueName, message);

    console.log(`Message sent to queue '${queueName}'`);
  }
}
