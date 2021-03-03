import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { LoggingService, LoggingServiceOptions } from './Logging.service';
import { LOGGING_OPTIONS } from './provideConstants';

@Global()
@Module({
	providers: [LoggingService],
	exports: [LoggingService],
})
export class LoggingModule {
	static register(options: LoggingServiceOptions): DynamicModule {
		const provider: Provider<LoggingServiceOptions> = {
			provide: LOGGING_OPTIONS,
			useValue: options,
		};

		const allLoggers = [
			...(options.verbose ?? []),
			...(options.info ?? []),
			...(options.warning ?? []),
			...(options.error ?? []),
		];

		return {
			module: LoggingModule,
			providers: [
				provider,
				...new Set(allLoggers),
			]
		}
	}
}
