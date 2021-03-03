import { DynamicModule, Inject, Injectable, Scope, Type } from '@nestjs/common';
import { ModuleRef, REQUEST } from '@nestjs/core';
import { DatabaseConnection } from './DatabaseConnection';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_POOL } from './provideConstants';

export interface DatabaseServiceOptions {
	user: string;
	password: string;
	host: string;
	database: string;
	loggingModule?: Type<any> | DynamicModule;
}

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService {
	@Inject(REQUEST)
	private request: any;

	@Inject(DATABASE_POOL)
	private poolService: DatabasePoolService;

	public async getConnection(): Promise<DatabaseConnection> {
		const { databaseConnectionId } = this.request?.__nestToolkit ?? {};
		return await this.poolService.getConnection(databaseConnectionId as number);
	}
}
