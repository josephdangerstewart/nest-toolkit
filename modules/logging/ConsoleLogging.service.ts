import { Injectable } from '@nestjs/common';
import { ILoggingService } from './ILoggingService';
import { LogLevel } from './LogLevel';

@Injectable()
export class ConsoleLoggingService implements ILoggingService {
	log(message: string, level: LogLevel) {
		if (level === LogLevel.Error) {
			console.error(message);
		} else if (level === LogLevel.Warning) {
			console.warn(message);
		} else {
			console.log(message);
		}
	}
}
