import { DynamicModule, forwardRef, Inject, Injectable, Scope, Type } from '@nestjs/common';
import { ModuleRef, REQUEST } from '@nestjs/core';
import { DatabaseConnection } from './DatabaseConnection';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_POOL } from './provideConstants';
import { RequestContext } from '../request-context';

export interface DatabaseServiceOptions {
	user: string;
	password: string;
	host: string;
	database: string;
	loggingModule?: Type<any> | DynamicModule;
}

@Injectable()
export class DatabaseService {
	@Inject(forwardRef(() => ModuleRef))
	private ref: ModuleRef;

	@Inject(DATABASE_POOL)
	private poolService: DatabasePoolService;

	public async getConnection(): Promise<DatabaseConnection> {
		const { requestId } = RequestContext.current ?? {};
		return await this.poolService.getConnection(requestId);
	}
}
