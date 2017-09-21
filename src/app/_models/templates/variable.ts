export class Variable {
    id: number;
	position: number;
    name: string;
	description: string;
	'default': string
	
	protocol_variable: boolean;
	advanced_variable: boolean;
	mandatory: boolean;
	
	// cardinality means :
	// -1 : this variable has a FIXED value, equals to the default value (ex. --remote for SSH checks.)
	// 0 : this variable is a toggle, so no value is supposed to be provided (ex. --invert)
	// 1 : one value is provided
	// 2 : multiple values may be provided (ex. --option 'opt1' --option 'opt2' ...) (TODO : unmanaged for now)
	cardinality: number;
	
	constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}