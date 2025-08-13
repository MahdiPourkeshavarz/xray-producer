/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendMessage(@Body() payload: any) {
    await this.producerService.sendMessage(payload);

    return {
      message: 'Payload has been sent to the queue.',
      payloadSent: payload,
    };
  }
}
