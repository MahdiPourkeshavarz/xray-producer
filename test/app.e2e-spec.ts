/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProducerController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/producer/send (POST)', () => {
    it('should accept a valid payload and return a 202 Accepted status with a confirmation message', () => {
      const testPayload = {
        'e2e-test-device': {
          time: Date.now(),
          data: [[100, [1, 2, 3.0]]],
        },
      };

      return request(app.getHttpServer())
        .post('/producer/send')
        .send(testPayload)
        .expect(202) // Check for HttpStatus.ACCEPTED
        .then((response) => {
          // Verify the structure and content of the response body
          expect(response.body).toEqual({
            message: 'Payload has been sent to the queue.',
            payloadSent: testPayload,
          });
        });
    });

    it('should correctly handle an empty JSON object as a payload', () => {
      const emptyPayload = {};

      return request(app.getHttpServer())
        .post('/producer/send')
        .send(emptyPayload)
        .expect(202)
        .then((response) => {
          expect(response.body.message).toEqual(
            'Payload has been sent to the queue.',
          );
          expect(response.body.payloadSent).toEqual({});
        });
    });
  });
});
