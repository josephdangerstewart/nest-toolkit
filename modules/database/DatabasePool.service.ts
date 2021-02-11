import { Pool } from 'mysql';
import * as mysql from 'mysql';
import { Injectable } from '@nestjs/common';
import { DatabaseConnection } from './DatabaseConnection';

@Injectable()
export class DatabasePoolService {
	private pool: Pool;
	private openConnections: { [connectionId: number]: DatabaseConnection };
	private connectionsToClose: DatabaseConnection[];

	constructor() {
		this.pool = mysql.createPool({
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			host: process.env.DATABASE_HOST,
			database: process.env.DATABASE_SCHEMA,
			typeCast,
			queryFormat,
		});

		this.openConnections = {};
		this.connectionsToClose = [];
	}

	public async openConnectionForRequest(): Promise<number> {
		const connectionId = this.getNextConnectionId();
		const connection = await this.openConnectionFromPool();
		this.openConnections[connectionId] = connection;
		return connectionId;
	}

	public async getConnection(connectionId: number): Promise<DatabaseConnection> {
		if (connectionId && this.openConnections[connectionId]) {
			return this.openConnections[connectionId];
		}

		const connection = await this.openConnectionFromPool();
		this.connectionsToClose.push(connection);
		return connection;
	}

	public releaseConnections(connectionId?: number): void {
		for (const connection of this.connectionsToClose) {
			connection.dispose();
		}
		this.connectionsToClose = [];

		if (connectionId && this.openConnections[connectionId]) {
			this.openConnections[connectionId].dispose();
			this.openConnections[connectionId] = null;
		}
	}

	private openConnectionFromPool(): Promise<DatabaseConnection> {
		return new Promise<DatabaseConnection>((resolve, reject) => {
			this.pool.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				}
				const dbConnection = new DatabaseConnection(connection);
				return resolve(dbConnection);
			});
		})
	}

	private getNextConnectionId(): number {
		const existingKeys = Object.keys(this.openConnections).map(parseInt).sort();

		if (existingKeys.length === 0) {
			return 0;
		}

		for (let i = 0; i < existingKeys.length; i++) {
			if (existingKeys[i + 1] !== existingKeys[i] + 1) {
				return existingKeys[i] + 1;
			}
		}

		return Math.max(...existingKeys) + 1;
	}

	async onModuleDestroy() {
		if (this.connectionsToClose.length !== 0) {
			console.error('Not all connections were released before app shutdown');

			for (const connection of this.connectionsToClose) {
				connection.dispose();
			}
		}

		const requestScopedConnections = Object.values(this.openConnections).filter(Boolean);
		if (requestScopedConnections.length !== 0) {
			console.error('Not all request scoped connections were released before app shutdown');
			
			for (const connection of requestScopedConnections) {
				connection.dispose();
			}
		}

		this.pool.end();
	} 
}

/**
 * @description This is a utility function for the mysql module that formats queries and safely
 * escapes user entered input
 */
function queryFormat(query, values) {
	if (!values) return query;
	query = query.replace(/:"([\w\d]+)"/g, function (txt, key) {
		if (values.hasOwnProperty(key)) {
			if (Array.isArray(values[key])) {
				return this.escape(values[key].join(','));
			}
			return `"${this.escape(values[key])}"`;
		}
		return 'NULL';
	}.bind(this));
	query = query.replace(/:\(([\w\d]+)\)/g, function (txt, key) {
		if (values.hasOwnProperty(key)) {
			return this.escapeId(values[key]);
		}
		return '';
	}.bind(this));
	return query.replace(/:([\w\d]+)/g, function (txt, key) {
		if (values.hasOwnProperty(key)) {
			return this.escape(values[key]);
		}
		return 'NULL';
	}.bind(this));
}

/**
 * @description This is a utility function for the mysql module that typecasts the MySQL BIT
 * datatype to a javascript boolean
 */
function typeCast(field, useDefaultTypeCasting) {
	if ((field.type === 'BIT') && (field.length === 1)) {
		const bytes = field.buffer();
		return (bytes[0] === 1);
	}
	return (useDefaultTypeCasting());
}
