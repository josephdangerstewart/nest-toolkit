import { OAuth2Strategy, Profile, VerifyFunction } from 'passport-google-oauth';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { IUserService } from '../users';
import { GOOGLE_STRATEGY_OPTIONS, USER_SERVICE } from './provideConstants';

export interface GoogleStrategyOptions {
	clientID: string;
	clientSecret: string;
	baseUrl: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(OAuth2Strategy, 'google') {
	@Inject(USER_SERVICE)
	private userService!: IUserService;
	
	constructor(@Inject(GOOGLE_STRATEGY_OPTIONS) options: GoogleStrategyOptions) {
		super({
			clientID: options.clientID,
			clientSecret: options.clientSecret,
			callbackURL: `${options.baseUrl}/auth/google/redirect`,
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyFunction) {
		const { displayName } = profile;
		const email = profile.emails?.[0]?.value;
		const user = await this.userService.getOrCreateUser(displayName, email);
		return user;
	}
}
