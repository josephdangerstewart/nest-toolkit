import { LogLevel } from './LogLevel';

export interface ILoggingService {
	/**
	 * Logs a message
	 *
	 * @param message The message to log
	 * @param level The level to log the message at. Defaults to
	 * LogLevel.Info
	 */
	log(message: string, level?: LogLevel): Promise<void>;
}
