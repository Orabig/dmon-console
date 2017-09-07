export class Technology {
    id: number;
    name: string;
	iconUri: string;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}