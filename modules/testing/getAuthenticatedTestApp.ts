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

interface UserReference<TUser extends IUser = IUser> {
	user: IUser;
}

@Injectable()
class MockAuthMiddleware implements NestMiddleware {
	@Inject(AUTHED_USER)
	private getAuthedUser: () => UserReference;

	use(req: any, res: any, next: () => void) {
		req.user = this.getAuthedUser().user;
		next();
	}
}

@Module({})
class MockAuthModule implements NestModule {
	static register(getUser: () => UserReference, appModule: Importable): DynamicModule {
		const userProvider: Provider<() => UserReference> = {
			useValue: getUser,
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

export async function getAuthenticatedTestApp<TUser extends IUser = IUser>(appModule: Importable, userOrGetUser: Partial<TUser> | (() => Partial<TUser>) = {}): Promise<INestApplication> {
	let userRef: UserReference<TUser> = {
		user: {
			email: uuid().replace(/\-/g, '') + '@example.com',
			name: uuid(),
		}
	};

	let getUser: () => UserReference<TUser> = () => {
		return {
			user: {
				...userRef.user,
				...(typeof userOrGetUser === 'function' ? userOrGetUser() : userOrGetUser),
			}
		}
	};

	let app: INestApplication;
	try {
		const TestModule = MockAuthModule.register(getUser, appModule);
		const module = await Test.createTestingModule({
			imports: [TestModule],
		}).compile();
	
		app = module.createNestApplication();
	} catch (err) {
		console.error(`encountered a fatal error, terminating process\n\n${JSON.stringify(err)}`);
		process.kill(1);
	}

	const userService = app.get(USER_SERVICE) as IUserService;
	const createdUser = await userService.getOrCreateUser(userRef.user.email, userRef.user.name);

	try {
		const databasePoolService = app.get(DATABASE_POOL) as DatabasePoolService;
		databasePoolService.releaseConnections();
	} catch {}

	userRef.user = {
		...userRef.user,
		...createdUser,
	};

	try {
		await app.init();
	} catch (err) {
		console.error(`encountered a fatal error, terminating process\n\n${JSON.stringify(err)}`);
	}
	return app;
}
