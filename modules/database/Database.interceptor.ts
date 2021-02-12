import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_POOL } from './provideConstants';

@Injectable()
export class DatabaseInterceptor<T> implements NestInterceptor<T, T> {
	@Inject(DATABASE_POOL)
	private databasePool: DatabasePoolService;

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
		const databaseConnectionId = await this.databasePool.openConnectionForRequest();

		const request = context
			.switchToHttp()
			.getRequest();

		request.__nestToolkit = {
			databaseConnectionId,
		}

		return next
			.handle()
			.pipe(
				tap(() => this.databasePool.releaseConnections(databaseConnectionId))
			);
	}
}
