import { Argument } from './argument';

export class Agent {
  id: string;
  implantation_id: string;
  command_id: number;
  family_id: number;
  relay_id: string;
  name: string;
  computedCmdLine: string;
  arguments: Argument[];
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}