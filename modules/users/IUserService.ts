import { IUser } from './IUser';

export interface IUserService {
	getOrCreateUser(name: string, email: string): Promise<IUser>;
}
