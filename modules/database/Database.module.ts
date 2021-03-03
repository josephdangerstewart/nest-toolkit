import { Module, Global, DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core'; 
import { DatabaseService, DatabaseServiceOptions } from './Database.service';
import { DatabasePoolService } from './DatabasePool.service';
import { DatabaseInterceptor } from './Database.interceptor';
import { DATABASE_OPTIONS, DATABASE_POOL } from './provideConstants';

@Global()
@Module({
	providers: [
		DatabaseService,
		{
			provide: DATABASE_POOL,
			useClass: DatabasePoolService,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: DatabaseInterceptor,
		}
	],
	exports: [
		DatabaseService,
		{
			provide: DATABASE_POOL,
			useClass: DatabasePoolService,
		},
	]
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
			],
		}
	}
}
