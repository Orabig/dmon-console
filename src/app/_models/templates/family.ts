export class Family {
    id: number;
    name: string;
	remote: boolean;
	protocol: string;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}