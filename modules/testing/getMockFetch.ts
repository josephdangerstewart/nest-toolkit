import { INestApplication } from '@nestjs/common';
import { makeFetch, FetchFunction } from 'supertest-fetch';

export function getMockFetch(app: INestApplication): FetchFunction {
	return makeFetch(app.getHttpServer());
}
