import {
	Injectable,
	Module,
	NestModule,
	Type,
	DynamicModule,
	ForwardReference,
	MiddlewareConsumer,
	RequestMethod,
	NestMiddleware,
	Inject,
	Provider,
	INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { IUser, IUserService } from '../users';
import { AUTHED_USER } from './provideConstants';
import { USER_SERVICE } from '../auth/provideConstants';
import { DATABASE_POOL } from '../database/provideConstants';
import { DatabasePoolService } from '../database/DatabasePool.service';

type Importable = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;

interface UserReference {
	user: IUser;
}

@Injectable()
class MockAuthMiddleware implements NestMiddleware {
	@Inject(AUTHED_USER)
	private authedUser: UserReference;

	use(req: any, res: any, next: () => void) {
		req.user = this.authedUser.user;
		next();
	}
}

@Module({})
class MockAuthModule implements NestModule {
	static register(user: UserReference, appModule: Importable): DynamicModule {
		const userProvider: Provider<UserReference> = {
			useValue: user,
			provide: AUTHED_USER,
		};

		return {
			module: MockAuthModule,
			imports: [appModule],
			providers: [userProvider],
		};
	}

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(MockAuthMiddleware).forRoutes({
			path: '*',
			method: RequestMethod.ALL,
		});
	}
}

export async function getAuthenticatedTestApp(appModule: Importable, user: Partial<IUser> = {}): Promise<INestApplication> {
	let mockUser: UserReference = {
		user: {
			email: uuid().replace(/\-/g, '') + '@example.com',
			name: uuid(),
			...user,
		},
	};

	const TestModule = MockAuthModule.register(mockUser, appModule);
	const module = await Test.createTestingModule({
		imports: [TestModule],
	}).compile();

	const app = module.createNestApplication();

	const userService = app.get(USER_SERVICE) as IUserService;
	const createdUser = await userService.getOrCreateUser(mockUser.user.email, mockUser.user.name);

	const databasePoolService = app.get(DATABASE_POOL) as DatabasePoolService;
	databasePoolService.releaseConnections();

	mockUser.user = {
		...mockUser.user,
		...createdUser,
	};

	await app.init();
	return app;
}
