export class Argument {
  id: string;
  agent_id: string;
  variable_name: string;
  value: string;
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}