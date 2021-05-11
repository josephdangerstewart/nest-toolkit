import { Module, Type, Provider, DynamicModule, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy, GoogleStrategyOptions } from './Google.strategy';
import { AuthController, AuthControllerOptions } from './Auth.controller';
import { IUserService } from '../users';
import { SessionSerializer } from './SessionSerializer';
import { AuthGuard } from './Auth.guard';
import { USER_SERVICE, GOOGLE_STRATEGY_OPTIONS, AUTH_CONTROLLER_OPTIONS } from './provideConstants';

interface GoogleAuthModuleOptions extends GoogleStrategyOptions, AuthControllerOptions {
	userService: Type<IUserService>;
}

@Global()
@Module({
	providers: [GoogleStrategy, AuthGuard],
	imports: [PassportModule.register({ session: true }), SessionSerializer],
	controllers: [AuthController],
	exports: [AuthGuard]
})
export class AuthModule {
	static register(options: GoogleAuthModuleOptions): DynamicModule {
		const userServiceProvider: Provider<IUserService> = {
			provide: USER_SERVICE,
			useExisting: options.userService,
		};
	
		const googleStrategyOptionsProvider: Provider<GoogleStrategyOptions> = {
			provide: GOOGLE_STRATEGY_OPTIONS,
			useValue: options,
		};

		const authControllerOptionsProvider: Provider<AuthControllerOptions> = {
			provide: AUTH_CONTROLLER_OPTIONS,
			useValue: options,
		}

		return {
			module: AuthModule,
			providers: [userServiceProvider, googleStrategyOptionsProvider, authControllerOptionsProvider],
			exports: [userServiceProvider],
		}
	}
}
