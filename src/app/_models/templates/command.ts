import { Variable } from './variable';

export class Command {
    id: number;
	family_id: number;
    name: string;
	description: string;
	plugin: string;
	cmdLine: string;
	DefaultAgentName: string;
	variables: Variable[];
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}