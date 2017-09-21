import { Argument } from './argument';
import { Command } from '../templates';

export class Agent {
  id: string;
  implantation_id: string;
  
  command: Command;
  family_id: number;
  relay_id: string;
  name: string;
  computedCmdLine: string;
  arguments: Argument[];
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}