import { Agent } from '../_models/objects';
import { Command } from '../_models/templates';

// ----------------- Discovery rules

// Decodes output of "!check --list-plugin" and transforms to a plugin list
export function extractPluginList(stdout: string[]): any[] {
  var pluginRE = /^PLUGIN: (\S+)DESCRIPTION: *(.*?) *$/;
  return stdout.join("").split(/-{5,}/) // chaque plugin est sur une seule ligne (et séparé par des lignes)
				.sort()
				.map( line => {
					var match = pluginRE.exec(line); 
					if (!match) return null;
					var plugin = match[1];
					var description = match[2].replace(/ +/g," ");
					var name = description.replace(/^Check +(an? +)?/,"").replace(/ *(\.|\(|through|locally|in SNMP).*/,"");
					var local = !!description.match(/\blocal(ly)?\b/);
					var protocol = null;
					if (description.match( /\bSNMP\b/i)) protocol='SNMP';
					if (description.match( /\bSSH\b/i )) protocol='SSH';
					if (description.match( /\bTCP|SMTP\b/i )) protocol='TCP';
					if (description.match( /\bUDP\b/i )) protocol='UDP';
					if (description.match( /\bAPI\b/i )) protocol='API';
					if (description.match( /\bHTTP|Webpage\b/i )) protocol='HTTP';
					if (description.match( /\bJMX\b/i )) protocol='JMX';
					if (description.match( /\bws-management|WinRM|wsman\b/i )) protocol='WinRM';
					if (description.match( /\bcan use SSH\b/i )) {
						local = true; // There will be 2 families in that case (one local, and one with SSH)
						protocol='SSH';
					}
					if (protocol==null) local=true;
					return { name:name,	plugin:plugin, local:local, protocol:protocol, description:description, families:null};
				}).filter( plugin => plugin != null );
}

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

export function buildCommandLine(agent: Agent, command: Command): string {
	console.log("buildCommandLine on ",agent);
	var line = [ "!check --plugin "+agent.command.plugin+" --mode "+agent.command.name ];
	agent.arguments.forEach(arg => line.push('--'+arg['variable_name']+' '+arg.value));
	return line.join(' ');
}