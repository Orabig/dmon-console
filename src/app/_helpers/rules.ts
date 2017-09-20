// Business rules

// Tells if a given plugin's variable is dedicated to SSH
// variable is {name:..., description:...}
export function isSSHVariable(variable: any) {	
	if (variable.name.match(/SSH/i)) return true;
	if (variable.description.match(/SSH/i)) return true;
	if (variable.name=='hostname' && variable.description.match(/--remote/i)) return true;
	return false;
}
