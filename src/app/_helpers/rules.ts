import { Agent } from '../_models/objects';

// Business rules

// Tells if a given plugin's variable is dedicated to SSH
// variable is {name:..., description:...}
export function isSSHVariable(variable: any) {	
	if (variable.name.match(/SSH/i)) return true;
	if (variable.description.match(/SSH/i)) return true;
	if (variable.name=='hostname' && variable.description.match(/--remote/i)) return true;
	return false;
}

// Returns the validation regexp for the variable
export function isAdvancedVariable(variable: any) {
	if (variable.name=='sudo') return 1;
	if (variable.name=='timeout') return 1;
	if (variable.name.match( /^command\b/i )) return 1;
	return 0;
}

// Returns the cardinality for the variable (0 means boolean, 2 means multiple values)
export function extractCardinalityFromVariable(variable: any) {
	if (variable.description.match( /^Allows to /i )) return 0;
	if (variable.name=="ssh-option") return 2;
	return 1;
}

export function isMandatoryVariable(variable: any) {
	if (variable.name=="name" && ! variable.description.contains("empty")) return 1;
	return 0;
}

// Returns the validation regexp for the variable
export function extractValidationFromVariable(variable: any) {
	if (variable.description.match( / +\(default: +\d+\)/i )) {return "\\d+";}
	if (variable.description.match( /^\w+ in (seconds|minutes)/i )) {return "\\d+";}
	return null;
}

// Returns the default value (if any) from the variable, and changes the variable
export function extractDefaultFromVariable(variable: any) {
	var defRE = / +\(default: +(.*?)\)/i;
	var match = defRE.exec(variable.description); 
	if (!match) return null;
	var def = match[1];
	variable.description = variable.description.replace(defRE, "");
	if (def=="none") def="";
	if (def.match(/^'.*$/)) def=def.replace(/^'|'$/g,"");
	return def;
}

// ------------- Construction de la cmdLine

export function buildCommandLine(agent: Agent): string {
	console.log("buildCommandLine on ",agent);
	return "!check --plugin "+agent.command.plugin+" --mode "+agent.command.name;
}