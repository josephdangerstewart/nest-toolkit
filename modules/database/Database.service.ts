import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import { Pool } from 'mysql';
import { DatabaseConnection } from './DatabaseConnection';

export interface DatabaseServiceOptions {
	user: string,
	password: string,
	host: string,
	database: string
}

@Injectable()
export class DatabaseService {
	private pool: Pool;
	private openConnections: DatabaseConnection[];

	constructor() {
		this.pool = mysql.createPool({
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			host: process.env.DATABASE_HOST,
			database: process.env.DATABASE_SCHEMA,
			typeCast,
			queryFormat,
		});

		this.openConnections = [];
	}

	getConnection(): Promise<DatabaseConnection> {
		return new Promise<DatabaseConnection>((resolve, reject) => {
			this.pool.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				}
				const dbConnection = new DatabaseConnection(connection);
				this.openConnections.push(dbConnection);
				return resolve(dbConnection);
			});
		})
	}

	async onModuleDestroy() {
		for (const connection of this.openConnections) {
			connection.dispose();
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
