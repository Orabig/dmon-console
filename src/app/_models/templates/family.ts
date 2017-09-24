import { Command } from './command';

export class Family {
    id: number;
    name: string;
	description: string;
	local: boolean;
	protocol: any; // {id:2, name:'SSH'}
	commands: Command[];
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}