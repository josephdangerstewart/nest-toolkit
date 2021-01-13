import { Controller, Get, UseGuards, Inject, Res, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleLoginGuard } from './GoogleLogin.guard';
import { AUTH_CONTROLLER_OPTIONS } from './provideConstants';

export interface AuthControllerOptions {
	redirectUrl: string;
}

@Controller()
@ApiTags('auth')
export class AuthController {
	@Inject(AUTH_CONTROLLER_OPTIONS)
	private options: AuthControllerOptions;

	@Get('/auth/google')
	@ApiOperation({
		description: 'Hit this route to authenticate with the api'
	})
	@UseGuards(GoogleLoginGuard)
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	googleAuth() { }

	@Get('/auth/google/redirect')
	@UseGuards(GoogleLoginGuard)
	@Redirect('/')
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	googleAuthRedirect() {
		if (this.options.redirectUrl) {
			return { url: this.options.redirectUrl };
		}
	}
}
