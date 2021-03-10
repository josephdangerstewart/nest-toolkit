import { MiddlewareConsumer, NestModule, Module } from '@nestjs/common';
import { requestContextMiddleware } from './RequestContext';

@Module({})
export class RequestContextModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(requestContextMiddleware).forRoutes('*');
	}
}
