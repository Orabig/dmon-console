export class Family {
    id: number;
    name: string;
	plugin: string;
	description: string;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}