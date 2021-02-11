import { Module, Global, DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core'; 
import { DatabaseService, DatabaseServiceOptions } from './Database.service';
import { DatabasePoolService } from './DatabasePool.service';
import { DatabaseInterceptor } from './Database.interceptor';
import { DATABASE_OPTIONS } from './provideConstants';

@Global()
@Module({
	providers: [
		DatabaseService,
		DatabasePoolService,
		{
			provide: APP_INTERCEPTOR,
			useClass: DatabaseInterceptor,
		}
	],
	exports: [DatabaseService, DatabasePoolService],
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
