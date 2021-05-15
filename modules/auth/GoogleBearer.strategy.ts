import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { IUser, IUserService } from '../users';
import { USER_SERVICE } from './provideConstants';
import { google, oauth2_v2 } from 'googleapis';

@Injectable()
export class GoogleBearerStrategy extends PassportStrategy(BearerStrategy, 'google-bearer') {
	@Inject(USER_SERVICE)
	private userService!: IUserService;

	async validate(token): Promise<IUser | false> {
		if (!token) {
			return false;
		}

		let googleUser: oauth2_v2.Schema$Userinfo;
		try {
			const response = await google.oauth2('v2').userinfo.get({ oauth_token: token });

			if (response.status !== 200 || !response.data) {
				return false;
			}

			googleUser = response.data;
		} catch (err) {
			return false;
		}

		if (!googleUser.email || !googleUser.name) {
			return false;
		}

		const appUser = await this.userService.getOrCreateUser(googleUser.name, googleUser.email);

		return appUser;
	}
}
