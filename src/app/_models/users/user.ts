import { Organization } from './organization';

export class User {
    id: number;
    userName: string;
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