import { Type, DynamicModule, ForwardReference, NestMiddleware, Module, NestModule, MiddlewareConsumer, RequestMethod, INestApplication } from '@nestjs/common';
import { FetchFunction, makeFetch } from 'supertest-fetch';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';
import { IUser, IUserService } from '../users';
import { USER_SERVICE } from '../auth/provideConstants';
import * as nodeFetch from 'node-fetch';

type Importable = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>;
type CreateAuthenticatedFetch<TUser extends IUser = IUser> = (user: Partial<TUser> | (() => Partial<TUser>)) => Promise<FetchFunction>;

class AuthMiddleware implements NestMiddleware {
	use(req: Request, res: any, next: () => void) {
		const rawUser = req.headers['x-cbtesting-user'];

		if (!rawUser || Array.isArray(rawUser)) {
			next();
			return;
		}

		const user = JSON.parse(rawUser);
		req.user = user;

		next();
	}
}

@Module({})
class MockAuthModule implements NestModule {
	static register(appModule: Importable): DynamicModule {
		return {
			module: MockAuthModule,
			imports: [appModule],
		};
	}

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes({
			path: '*',
			method: RequestMethod.ALL,
		});
	}
}

export async function getTestServer(appModule: Importable): Promise<[app: INestApplication, createFetch: CreateAuthenticatedFetch]> {
	const testModule = MockAuthModule.register(appModule);
	const serverModule = await Test.createTestingModule({
		imports: [testModule],
	}).compile();
	const app = serverModule.createNestApplication();

	const createFetch: CreateAuthenticatedFetch = async (userOrGetUser) => {
		const getUser = () => typeof userOrGetUser === 'function' ? userOrGetUser() : userOrGetUser;

		const userService = app.get(USER_SERVICE) as IUserService;

		const userToCreate = {
			email: uuid().replace(/\-/g, '') + '@example.com',
			name: uuid(),
			...getUser(),
		};
		const createdUser = await userService.getOrCreateUser(userToCreate.name, userToCreate.email);

		const getAuthedUser = () => ({
			...createdUser,
			...getUser(),
		});

		const fetchCore = makeFetch(app.getHttpServer());

		return (url: string | nodeFetch.Request, init?: nodeFetch.RequestInit | undefined) => {
			return fetchCore(url, {
				...(init ?? {}),
				headers: {
					...(init.headers ?? {}),
					['x-cbtesting-user']: JSON.stringify(getAuthedUser()),
				},
			});
		}
	}

	await app.init();
	return [app, createFetch];
}
