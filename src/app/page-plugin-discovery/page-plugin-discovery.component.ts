import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Host } from '../_models/objects/index';
import { User } from '../_models/users/user';
import { Family } from '../_models/templates/family';
import { Command } from '../_models/templates/command';
import { Variable } from '../_models/templates/variable';
import { ObjectsDataService, TemplatesDataService, CentrifugeService, HostService, GroupService, SendCommandService, HttpInterceptorService } from '../_services/index';

import { environment } from '../../environments/environment';

import { generateUUID } from '../_helpers/utils';
import { extractPluginList, 
		 isSSHVariable,
		 extractDefaultFromVariable,
		 extractValidationFromVariable,
		 isAdvancedVariable,
		 extractCardinalityFromVariable,
		 isMandatoryVariable } from '../_helpers/rules';

@Component({
  selector: 'app-page-plugin-discovery',
  templateUrl: './page-plugin-discovery.component.html',
  styleUrls: ['./page-plugin-discovery.component.css'],
  providers: [ GroupService ]
})
export class PagePluginDiscoveryComponent implements OnInit, OnDestroy {

  hosts: Host[] = [];
  selectedHost: Host;
  connectionState: string;
  user: User;
  groupId: string;
  outputStep2: string;
  outputStep4: string;
  outputStep5: string;
  plugins: any[];
  selectedPlugin: any;
  selectedPluginModes: string[];
  selectedCommand: any;

  constructor(  private hostService: HostService,
				private groupService: GroupService,
				private sendCommandService: SendCommandService,
				private httpInterceptorService: HttpInterceptorService,
				private templatesDataService: TemplatesDataService,
				private objectsDataService: ObjectsDataService,
				private centrifugeService: CentrifugeService) {  }

  ngOnInit() {
	this.user = JSON.parse(localStorage.getItem('currentUser')) as User;
	this.initCentrifuge();
	this.getDefaultGroup();
  }
  
  ngOnDestroy(): void {
	  this.centrifugeService.disconnect();
  }
  
  // TODO : ce code est quasi identique à celui dans group.composant : mutualiser les deux (et déplacer getToken dans UserService)
  // ngOnInit >> Initialisation de Centrifuge
  initCentrifuge() {
	  var user = this.user;
	  var timestamp = (Date.now() | 0).toString();
	  var info= {
		  class:"console",
		  lastName: user.lastName,
		  // firstName: user.firstName   TODO : Attention aux caractères spéciaux !!
		  };
	  // Ask for token
	  this.hostService.getToken(user.userName,timestamp,info).subscribe( 
		// Then connect to centrifuge
		token => this.connectToCentrifuge(user.userName,timestamp,info,token)
	  );
  }
  
  // ngOnInit >> Trouver le groupe par défaut de l'administrateur
  getDefaultGroup() {
    this.groupService.getGroups(this.user.organization.id)
		.subscribe(groups => this.setGroup(groups['default']));
  }
  
  // ngOnInit >> getDefaultGroup >> Le groupe a été récupéré, il faut maintenant interroger la liste des membres qui en font partie
  setGroup(id:string) {
	  this.groupId = id;
	  this.httpInterceptorService.getJson('get-group-members.php', { group: id} )
		.subscribe( hosts => this.hosts = hosts );
  }
  
  // ngOnInit >> initCentrifuge
  // Le token a été récupéré, on peut se connecter à Centrifugo
  connectToCentrifuge(user:string, timestamp:string, info:any, token:string):void {
	  this.centrifugeService.connect({
		url: environment.centrifugoServerUrl,
		user: user,
		timestamp: timestamp,
		info: JSON.stringify( info ),
		token: token,
		debug: ! environment.production,
		authEndpoint: environment.centrifugoAuthEndpoint
	});
	  this.centrifugeService.getStates().subscribe(
		state => this.connectionState = state.type==='state' ? state.state : this.connectionState
	  );
	}
	
  
  // Step 1 : User selects a hosts
  selectHost(host: Host) {
	this.selectedHost = host
	this.requestPluginList();
  }
  
  // EXECUTE '!check --list-plugin' and listens for results
  requestPluginList() {
	  this.getResultFromSelectedHost("!check --list-plugin")
		.map( data => data['stdout'])
		.subscribe(
			stdout => this.processPluginList(stdout),
			err  => console.error(err));
  }
  
  // fills this.plugins with a plugin list : {name, plugin, description}
  // This list is shown to user
  processPluginList(stdout: string[]) {
	  // Display the result of the command line (optional, just for debug)
	  this.outputStep2 = stdout.slice(2,13).join("\n") + "\n(......)";
	  // PROCESS the output of --list-plugin
	  this.plugins = extractPluginList(stdout);
  }
  
  // ---------------------------------- The pluginlist is displayed : the user has to click on one of them (Ex; Linux)
  
  // USER clicked on a Plugin
  selectPlugin(plugin: any) {
	  // This will show the family details (name, description)
	  this.selectedPlugin = plugin;
	  this.loadKnownFamily(plugin); // Cherche dans la base de donnée si une ou plusieurs familles correspondent, et dans ce cas, alimente selectedPlugin.families
	  this.requestPluginModes(plugin); // Execute "--list-mode" ce qui donne la liste des modes, mais aussi les options "Global"
  }
  
  // Request to DB : load families with the same name than the one clicked
  loadKnownFamily(plugin: any) {
	  this.templatesDataService.getFamiliesByName(plugin.name).subscribe(
		families => this.selectedPlugin.families = families.length>0 ? families : null
	  )
  }
  
  // USER clicked on a Plugin >> selectPlugin() >>
  // Execute    !check --plugin ... --list-mode
  // And display the result (list of modes)
  requestPluginModes(plugin) {
	  this.getResultFromSelectedHost("!check --plugin " + plugin.plugin + " --list-mode")	    
		.map( data => data['stdout'].join("\n"))
		.subscribe(
			data => this.processModes(data),
			err  => console.error(err)); // Unsubscribe when we get the message
  }
  
  // Execute    !check --plugin ... --list-sqlmode (or --list-custommode)
  // And add what is found in plugin definition
  requestProtocolModes(protocol:string, plugin) {
	  this.getResultFromSelectedHost("!check --plugin " + plugin.plugin + " --list-" + protocol + "mode")	    
		.map( data => data['stdout'].join("\n"))
		.subscribe(
			data => this.processProtocolModes(protocol, data),
			err  => console.error(err)); // Unsubscribe when we get the message
  }

  // USER clicked on Family/SAVE  
  saveSelectedPluginToFamily() {
	  if (this.selectedPlugin.families == null) {
		  this.selectedPlugin.families = []; // Will be filled in this.saveFamily()
		  // Some plugins are both local AND have a protocol (SSH), so there are 2 families to save
		  this.selectedPlugin.protocols.forEach(
			protocol => this.saveFamily( new Family( { 
				name: this.selectedPlugin.name,
				description: this.selectedPlugin.description,
				local: protocol == null,
				protocol: protocol
		  } ))
		  /*if (this.selectedPlugin.local) this.saveFamily( new Family( {  // <<<<<<<<<<< protocols (null/SSH...)
				name: this.selectedPlugin.name,
				description: this.selectedPlugin.description,
				local: true,
				protocol: null // --- local
		  } ));
		  if (this.selectedPlugin.protocol!=null) this.saveFamily( new Family( {
				name: this.selectedPlugin.name,
				description: this.selectedPlugin.description,
				local: false,
				protocol: this.selectedPlugin.protocol // --- SSH
		  } ));*/
		  );
	  }
  }
  
  saveFamily( family: Family ) {
	  this.templatesDataService.insertOrUpdateFamilyByNameLocalProtocol( family )
		.subscribe(family => this.selectedPlugin.families.push( family ));
  }
  
  // USER clicked on Back
  cancelSelectedPlugin() {
	  this.selectedPlugin = null;
	  this.outputStep4='';
	  this.outputStep5='';
	  this.selectedPluginModes=null;
	  this.selectedCommand=null;
  }
  
  // Will display the list of modes for this plugin (1-2 family)
  // Also stdout may contain : 
  //   --list-(*)mode and --(*)mode (eg. sql) in which case requestProtocolModes>>processProtocolMode est appelé
  processModes(stdout: string) {
	  // DISPLAY
	  this.outputStep4 = "********* " + this.selectedPlugin.plugin + " *********\n" + stdout;
	  
	  // CUSTOM MODES (--list-custommode or --list-sqlmode)
	  var customRE = /--list-(\w+)mode/g;
	  var custom;
	  while( custom = customRE.exec(stdout) ) {
		  var protocol = custom[1]; // 'sql' or 'custom'
		  if (protocol != 'custom') { // Pour le moment, je n'ai trouvé aucun --custommode qui soit utile (Tomcat/AWS ne change pas le fonctionnement du plugin)
			this.requestProtocolModes(protocol, this.selectedPlugin);
		  }
	  }
	  
	  // PROCESS
	  var modesRE = /Modes Available:\s+(.*?) *$/;
	  stdout=stdout.replace(/\n/g,"");
	  var modes = modesRE.exec(stdout);
	  if (modes) {
			this.selectedPluginModes = modes[1].split(/ +/);
		} else {
			// Modes available n'apparait pas : sans doute une erreur de library
			var missingLibRE = /Can't locate (\S+) in @INC/;
			var modes = missingLibRE.exec(stdout);
			if (modes) {
				// TODO : Required library for this plugin
				console.log("Pre-requis : ",modes[1]);
			} else {
				console.error("Unknown output : ",stdout);
			}
		}
  }
  
  processProtocolModes(protocol: string, stdout: string) {
	  // DISPLAY
	  this.outputStep4 = this.outputStep4+"\n\n***** PROTOCOL : "+protocol+" ****\n" + stdout;

	  // PROCESS list of additional protocols
	  var modesRE = /Modes Available:\s+(.*?) *$/;
	  stdout=stdout.replace(/\n/g,"");
	  var modes = modesRE.exec(stdout);
	  if (modes) {
			modes[1].split(/ +/).forEach( protocol => this.selectedPlugin.protocols.push( protocol ) );
		} else {
			// Modes available n'apparait pas : sans doute une erreur de library
			var missingLibRE = /Can't locate (\S+) in @INC/;
			var modes = missingLibRE.exec(stdout);
			if (modes) {
				// TODO : Required library for this plugin
				console.log("Pre-requis : ",modes[1]);
			} else {
				console.error("Unknown output : ",stdout);
			}
		}
  }
  
  // User clicked on a mode
  selectMode(mode: string) {
	  this.requestPluginCommand(this.selectedPlugin, mode);
  }
  
  // USER click >> selectMode() >>
  // Execute    !check --plugin ... --mode ... --help
  requestPluginCommand(family, mode) {
	  this.getResultFromSelectedHost("!check --plugin " + family.plugin + " --mode " + mode + " --help")
		.map( data => data['stdout'].join(";;").replace(/.*;;;;Mode:;;/,'').replace(/;;/g,"\n"))
		.subscribe(
			help => this.processCommand(mode, family.plugin, help),
			err  => console.error(err)); // Unsubscribe when we get the message
  }
  
  // Reads the result of '--mode mode --help' to display the command description and variables
  processCommand(mode: string, plugin: string, stdout: string) {	  
	  // DISPLAY
	  this.outputStep4 = '';
	  this.outputStep5 = stdout;
	  // PROCESS
	  var paragraphs = stdout.split(/\n\n/); // Arguments are in paragraphs separed with 2 newlines ...
	  var description = paragraphs.shift().replace(/^ +/,'');
	  var position=0;
	  var variables = paragraphs.map(help => {
			var nameRE = /^ +--(\S+)/; // ... and start with "  --argument ...."
			var match = nameRE.exec(help);
			if (!match) {
				console.error("Erreur de definition de variable pour le plugin "+this.selectedPlugin.plugin+" mode "+mode);
				return null;
			} else {
				var varName = match[1];
				var varDesc = help.replace(nameRE,'').replace(/[\n ]+/g,' ');
				position = position + 1;
				return { name: varName, description: varDesc, position: position };
			}
		  }).filter(variable => variable!=null);
	  this.selectedCommand = {
		  name: mode,
		  description: description,
		  plugin: plugin,
		  discovery: mode.match(/^list-/),
		  cmdLine: '',
		  defaultAgentName: '',
		  variables: variables
		  };
 }
 
 // USER clicked on "Save" : should init the save of command and variables
 saveSelectedModeToCommand() {
	 if (this.selectedCommand.id == null) {
		this.saveCommand( new Command( { // ?????
				name: this.selectedCommand.name,
				description: this.selectedCommand.description,
				plugin: this.selectedCommand.plugin,
				cmdLine: this.selectedCommand.cmdLine,
				DefaultAgentName: this.selectedCommand.DefaultAgentName,
				variables: this.selectedCommand.variables
		  } ));
	  }
 }
 
 // Sauve la commande avec ses arguments pour la famille sélectionnée (ou les familles si SSH+local)
 saveCommand(command: Command) {
	this.selectedPlugin.families.forEach(family =>
		{
		var familyId = family.id;
		var protocol = family.protocol;
		// JSON trick to do deep copy
		var fixedCommand = Object.assign({},JSON.parse(JSON.stringify(command)), {family_id: familyId});
		if (protocol!="SSH") {
			// Removes the SSH specific variables
			var localVariables = command.variables.filter(variable=> ! isSSHVariable(variable));
			fixedCommand = Object.assign(fixedCommand, {variables: localVariables});
		} else {
			// Mark the SSH variables as "protocol_variable"
			fixedCommand.variables.filter(variable=> isSSHVariable(variable))
				.forEach(variable=> variable.protocol_variable=true);
		}
		fixedCommand.variables
			.forEach(variable=> {
				variable['advanced_variable']=isAdvancedVariable(variable);
				variable['validation']=extractValidationFromVariable(variable);
				variable['mandatory']=isMandatoryVariable(variable);
				variable['cardinality']=extractCardinalityFromVariable(variable);
				variable['default']=extractDefaultFromVariable(variable); // This last step may change the description
			});
		this.templatesDataService.insertOrUpdateCommandByName(fixedCommand)
			.subscribe(command => this.selectedCommand.id = command.id); 
		}
	);
 }
 
  // ------------------------- Utility method (used several times here)
  
  getResultFromSelectedHost(cmdline: string): Observable<any> {
	  var cmdId = generateUUID();
	  var observable = this.centrifugeService.getMessagesOn('$'+this.groupId)
	    .map(message => message['data'])
		.filter( data=> data['cmdId']==cmdId && data['t']=='RESULT' )
		.skipWhile( data=> data['terminated'] == 0 ) // Only keep the completed result
		.take(1);
	  // On envoie la commande au host
	  this.sendCommandService.sendCommandLineWithId(this.selectedHost,cmdId,cmdline);  
	  return observable;
  }
}