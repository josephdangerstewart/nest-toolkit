import { Module, Type, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy, GoogleStrategyOptions } from './Google.strategy';
import { AuthController } from './Auth.controller';
import { IUserService } from '../users';
import { SessionSerializer } from './SessionSerializer';
import { AuthGuard } from './Auth.guard';
import { USER_SERVICE, GOOGLE_STRATEGY_OPTIONS } from './provideConstants';

interface GoogleAuthModuleOptions extends GoogleStrategyOptions {
	userService: Type<IUserService>;
}

export function getGoogleAuthModule(options: GoogleAuthModuleOptions) {
	const userServiceProvider: Provider<IUserService> = {
		provide: USER_SERVICE,
		useClass: options.userService,
	};

	const googleStrategyOptionsProvider: Provider<GoogleStrategyOptions> = {
		provide: GOOGLE_STRATEGY_OPTIONS,
		useValue: options,
	}

	@Module({
		providers: [GoogleStrategy, AuthGuard, userServiceProvider, googleStrategyOptionsProvider],
		imports: [PassportModule.register({ session: true }), SessionSerializer],
		controllers: [AuthController],
		exports: [AuthGuard]
	})
	class AuthModule { }

	return AuthModule;
}
