export class Application {
  id: string;
  name: string;
  organization_id: string;
  
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}