import { Agent } from '../_models/objects';
import { Command, Family } from '../_models/templates';

// ----------------- Discovery rules

// Decodes output of "!check --list-plugin" and transforms to a plugin list
export function extractPluginList(stdout: string[]): any[] {
  var pluginRE = /^PLUGIN: (\S+)DESCRIPTION: *(.*?) *$/;  
  return stdout.join("").split(/-{5,}/) // chaque plugin est sur une seule ligne (et séparé par des lignes)
				.sort()
				.map( line => {
					var match = pluginRE.exec(line); 
					if (!match) return null;
					var plugin = match[1]; // os::linux::local::plugin
					var description = match[2].replace(/ +/g," ");
					var name = description.replace(/^Check +(an? +)?/,"").replace(/ *(\.|\(|through|locally|in SNMP).*/,"");
					var protocols = [];
					if (!!description.match(/\blocal(ly)?\b/)) protocols.push(null);
					if (description.match( /\bSNMP\b/i)) protocols.push('SNMP');
					if (description.match( /\bTCP|SMTP\b/i )) protocols.push('TCP');
					if (description.match( /\bUDP\b/i )) protocols.push('UDP');
					if (description.match( /\bAPI\b/i )) protocols.push('API');
					if (description.match( /\bthrough .* Webpage\b/i )) protocols.push('HTTP');
					if (description.match( /\bJMX\b/i )) protocols.push('JMX');
					if (description.match( /\bthrough AMI\b/i )) protocols.push('AMI');
					if (description.match( /\bws-management|WinRM|wsman\b/i )) protocols.push('WinRM');
					if (description.match( /\bcan use SSH\b/i )) {
						if (protocols.length==0) protocols.push(null);
						protocols.push('SSH');
					} else if (description.match( /\bSSH\b/i )) {
						protocols.push('SSH');
					}

					if (protocols.length==0) {
						if (plugin.match(/apps::protocols::.*::plugin/)) {
							var protocol = plugin.replace(/apps::protocols::|::plugin/g,'').toUpperCase();
							protocols.push(protocol)
						} else {
							protocols.push(null);
						}
					}
					
					// La description contient parfois des trucs débiles
					description = description.replace(/\s+You can use following options.*/,"");
					
					return { name:name,	plugin:plugin, protocols:protocols, description:description, families:null};
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
	if (variable.name=="name" && ! variable.description.match("empty")) return 1;
	if (variable.description.match("required")) return 1;
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

// Construit le début de la ligne de commande : !check --plugin XXX --mode YYY [ --ZZZmode PPP | --remote ]
export function buildBaseCommandLine(plugin,protocol,mode): string[] {
	// command line
	var line = [ "!check --plugin "+plugin ];
	// Mode
	line.push( "--mode "+mode );
	// Protocol
	if (protocol.match(/\w+:\w+/)) { // Exemple : sql:dbi
		var custom = protocol.replace(/:.*/,''); // sql
		var mode = protocol.replace(/.*:/,''); // dbi
		line.push( "--" + custom + "mode " + mode ); // --sqlmode dbi
	}
	if (protocol=='SSH') {
		line.push('--remote');
	}
	return line;
}

export function buildHelpCommandLine(plugin,protocol,mode): string {
	var line = buildBaseCommandLine(plugin,protocol,mode);
	line.push("--help");
	return line.join(' ');
}

export function buildCommandLine(family: Family, agent: Agent): string {
	var plugin = agent.command.plugin;
	var protocol = family.protocol.name;
	var mode = agent.command.name;
	var line = buildBaseCommandLine(plugin,protocol,mode);
	// Arguments
	agent.arguments.forEach(arg => line.push('--'+arg['variable_name']+' '+arg.value));
	return line.join(' ');
}