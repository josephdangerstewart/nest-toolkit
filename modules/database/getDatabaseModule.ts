import { Module, Global, Provider } from '@nestjs/common';
import { DatabaseService, DatabaseServiceOptions } from './Database.service';
import { DATABASE_OPTIONS } from './provideConstants';

export function getDatabaseModule(options: DatabaseServiceOptions) {
	const databaseServiceProvider: Provider<DatabaseServiceOptions> = {
		provide: DATABASE_OPTIONS,
		useValue: options,
	}

	@Global()
	@Module({
		providers: [DatabaseService, databaseServiceProvider],
		exports: [DatabaseService]
	})
	class DatabaseModule { }

	return DatabaseModule;
}
