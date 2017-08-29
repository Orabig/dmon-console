import { Organization } from './organization';

export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
	email: string;
	entropy: string;
	organization: Organization;
	administrator: boolean;
	manager: boolean;
	validated: boolean;
}