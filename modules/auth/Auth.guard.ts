import { CanActivate, ExecutionContext, UnauthorizedException, UseGuards, Injectable } from '@nestjs/common';

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

export const Authenticate = () => UseGuards(AuthGuard);
