/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';

@Module({
  providers: [ProducerService],
  controllers: [ProducerController],
})
export class ProducerModule {}
