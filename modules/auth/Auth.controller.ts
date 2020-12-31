import { Controller, Get, UseGuards, Redirect } from '@nestjs/common';
import { GoogleLoginGuard } from './GoogleLogin.guard';

@Controller()
export class AuthController {
	@Get('/auth/google')
	@UseGuards(GoogleLoginGuard)
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	googleAuth() { }

	@Get('/auth/google/redirect')
	@UseGuards(GoogleLoginGuard)
	@Redirect('/hello')
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	googleAuthRedirect() { }
}
