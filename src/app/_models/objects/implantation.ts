import { Agent } from './agent';

export class Implantation {
  id: string;
  host_id: string;
  composant_id: string;
  agents: Agent[];
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}