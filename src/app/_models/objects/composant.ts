export class Composant {
  id: string;
  name: string;
  organization_id: string;
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}