import { Module, Global, DynamicModule } from '@nestjs/common';
import { DatabaseService, DatabaseServiceOptions } from './Database.service';
import { DATABASE_OPTIONS } from './provideConstants';

@Global()
@Module({
	providers: [DatabaseService],
	exports: [DatabaseService]
})
export class DatabaseModule {
	static register(options: DatabaseServiceOptions): DynamicModule {
		return {
			module: DatabaseModule,
			providers: [
				{
					provide: DATABASE_OPTIONS,
					useValue: options,
				}
			]
		}
	}
}
