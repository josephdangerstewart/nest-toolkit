import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DatabaseConnection } from './DatabaseConnection';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_POOL } from './provideConstants';

export interface DatabaseServiceOptions {
	user: string,
	password: string,
	host: string,
	database: string
}

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService {
	@Inject(REQUEST)
	private request: any;

	@Inject(DATABASE_POOL)
	private poolService: DatabasePoolService;

	getConnection(): DatabaseConnection {
		const { databaseConnectionId } = this.request?.__nestToolkit ?? {};

		if (!databaseConnectionId) {
			throw new Error('Request was not given a database connection');
		}

		return this.poolService.getConnection(databaseConnectionId as number);
	}
}
