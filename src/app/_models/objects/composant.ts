import { Agent } from './agent';
import { Technology } from '../templates/technology';

export class Composant {
  id: string;
  name: string;
  organization_id: string;
  technology: Technology;
  agents: Agent[]
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}