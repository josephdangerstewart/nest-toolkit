import { Module, Global, DynamicModule } from '@nestjs/common';
import { DatabaseService, DatabaseServiceOptions } from './Database.service';
import { DatabasePoolService } from './DatabasePool.service';
import { DATABASE_OPTIONS } from './provideConstants';

@Global()
@Module({
	providers: [DatabaseService, DatabasePoolService],
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
