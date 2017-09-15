export class Family {
    id: number;
    name: string;
	description: string;
	local: boolean;
	protocol_id: number;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}