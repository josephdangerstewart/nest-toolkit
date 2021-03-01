import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, Optional } from '@nestjs/common';
import { Observable, from, pipe, MonoTypeOperatorFunction } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { LoggingService, LogLevel } from '../logging';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_POOL } from './provideConstants';

export function asyncTap<T>(predicate: (value: T) => Promise<void>): MonoTypeOperatorFunction<T> {
    return pipe(
        // Convert the predicate Promise<boolean> to an observable (which resolves the promise,
        // Then combine the boolean result of the promise with the input data to a container object
        concatMap((data: T) => {
            return from(predicate(data))
                .pipe(
					map(() => ({ entry: data }))
				);
        }),
        // remove the data container object from the observable chain
        map(data => data.entry)
    );
}


@Injectable()
export class DatabaseInterceptor<T> implements NestInterceptor<T, T> {
	@Inject(DATABASE_POOL)
	private databasePool: DatabasePoolService;

	@Optional()
	@Inject()
	private logger: LoggingService;

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
		const databaseConnectionId = await this.databasePool.openConnectionForRequest();

		if (this.logger) {
			await this.logger.log(`Opened database connection with id ${databaseConnectionId}`, LogLevel.Verbose);
		}

		const request = context
			.switchToHttp()
			.getRequest();

		request.__nestToolkit = {
			databaseConnectionId,
		}

		const releaseAndLog = async () => {
			this.databasePool.releaseConnections(databaseConnectionId);
			if (this.logger) {
				await this.logger.log(`Releasing database connection with id ${databaseConnectionId}`);
			}
		}

		return next.handle().pipe(
			asyncTap(releaseAndLog),
		);
	}
}
