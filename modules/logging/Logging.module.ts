import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggingService, LoggingServiceOptions } from './Logging.service';
import { LOGGING_OPTIONS } from './provideConstants';

@Global()
@Module({
	providers: [LoggingService],
	exports: [LoggingService],
})
export class LoggingModule {
	static register(options: LoggingServiceOptions): DynamicModule {
		return {
			module: LoggingModule,
			providers: [
				{
					provide: LOGGING_OPTIONS,
					useValue: options,
				}
			]
		}
	}
}
