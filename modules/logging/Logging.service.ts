import { forwardRef, Inject, Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ILoggingService } from './ILoggingService';
import { LogLevel } from './LogLevel';
import { LOGGING_OPTIONS } from './provideConstants';

export interface LoggingServiceOptions {
	verbose?: Type<ILoggingService>[];
	info?: Type<ILoggingService>[];
	warning?: Type<ILoggingService>[];
	error?: Type<ILoggingService>[];
}

@Injectable()
export class LoggingService implements ILoggingService {
	@Inject(forwardRef(() => ModuleRef))
	private moduleRef: ModuleRef;

	@Inject(LOGGING_OPTIONS)
	private options: LoggingServiceOptions;

	async log(message: string, level: LogLevel = LogLevel.Info): Promise<void> {
		const loggers = this.getLoggersForLevel(level) ?? [];

		for (const loggerType of loggers) {
			const logger = await this.moduleRef.resolve(loggerType);
			await logger.log(message, level);
		}
	}

	private getLoggersForLevel(level: LogLevel): Type<ILoggingService>[] {
		switch (level) {
			case LogLevel.Verbose:
				return this.options?.verbose;
			case LogLevel.Info:
				return this.options?.info;
			case LogLevel.Warning:
				return this.options?.warning;
			case LogLevel.Error:
				return this.options?.error;
		}

		return [];
	}
}
