import { PoolConnection } from 'mysql';

type QueryParams = { [parameterName: string]: any };

interface ExecuteResults {
	insertId?: number;
	affectedRows?: number;
}

interface GenericObject {
	[key: string]: any;
}

export class DatabaseConnection {
	private connection: PoolConnection;
	private isDisposed: boolean;

	constructor(connection: PoolConnection) {
		this.connection = connection;
		this.isDisposed = false;
	}

	dispose(): void {
		if (this.isDisposed) {
			return;
		}
		this.connection.release();
		this.isDisposed = true;
	}

	updateFromObject<T = GenericObject>(tableName: string, idColumnName: string, id: number | string, obj: Partial<T>): Promise<ExecuteResults> {
		this.verifyValidColumnName(idColumnName);

		const updateSet = Object.entries(obj).map(([ key, value ]) => {
			if (value === undefined) {
				return null;
			}

			this.verifyValidColumnName(key);
			return `${key} = :${key}`;
		}).filter(Boolean);

		const query = `UPDATE ${tableName}
		SET
			${updateSet.join(',\n')}
		WHERE
			${idColumnName} = :${idColumnName}`;

		return this.execute(query, {
			...obj,
			[idColumnName]: id,
		});
	}

	insertFromObject<T = GenericObject>(tableName: string, obj: Partial<T>): Promise<ExecuteResults> {
		const columnNames = Object.entries(obj).filter((x) => x[1] !== undefined).map((c) => {
			this.verifyValidColumnName(c[0]);
			return c[0];
		});

		const valuePlaceholders = columnNames.map((c) => `:${c}`);

		const query = `INSERT INTO ${tableName}
		(${columnNames.join(', ')})
		VALUES
		(${valuePlaceholders.join(', ')})`;

		return this.execute(query, obj);
	}

	async query<T>(q: string, params: QueryParams = {}): Promise<T[]> {
		return (await this.queryCore(q, params)) as T[];
	}

	async execute(q: string, params: QueryParams = {}): Promise<ExecuteResults> {
		return (await this.queryCore(q, params)) as ExecuteResults;
	}

	private queryCore(q: string, params: QueryParams = {}): Promise<any> {
		return new Promise((resolve, reject) => {
			this.connection.query(
				q,
				params,
				(err, results) => {
					if (err) {
						reject(err);
					}

					resolve(results);
				}
			)
		});
	}

	private verifyValidColumnName(columnName: string): void {
		if (columnName.match(/[:\s]/)) {
			throw new Error(`${columnName} is not a valid column name`);
		}
	}
}
