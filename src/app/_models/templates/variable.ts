export class Variable {
    id: number;
    name: string;
	command_id: string;
	description: string;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}