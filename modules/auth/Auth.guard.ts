import { CanActivate, ExecutionContext, UnauthorizedException, UseGuards, Injectable } from '@nestjs/common';
import { AuthGuard as AuthGuardCore } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(
		context: ExecutionContext,
	): boolean {
		const request = context.switchToHttp().getRequest();

		if (!request.user) {
			throw new UnauthorizedException('User must be logged in');
		}

		return true;
	}
}

@Injectable()
class OptionalGoogleBearerAuthGuard extends AuthGuardCore('google-bearer') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		// If there is already a user on the request (via session), no need to
		// check the bearer token
		if (request.user) {
			return true;
		}

		await super.canActivate(context);
		return true;
	}

	handleRequest(err, user) {
		return user;
	}
}

export const Authenticate = () => UseGuards(OptionalGoogleBearerAuthGuard, AuthGuard);
