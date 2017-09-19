import { Command } from './command';

export class Family {
    id: number;
    name: string;
	description: string;
	local: boolean;
	protocol_id: number;
	commands: Command[];
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}