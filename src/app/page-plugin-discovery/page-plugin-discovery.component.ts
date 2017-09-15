import { Component, OnInit } from '@angular/core';
import { Host } from '../_models/objects/index';
import { User } from '../_models/users/user';
import { Family } from '../_models/templates/family';
import { ObjectsDataService, TemplatesDataService, CentrifugeService, HostService, GroupService, SendCommandService, HttpInterceptorService } from '../_services/index';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-page-plugin-discovery',
  templateUrl: './page-plugin-discovery.component.html',
  styleUrls: ['./page-plugin-discovery.component.css'],
  providers: [ GroupService, TemplatesDataService ]
})
export class PagePluginDiscoveryComponent implements OnInit {

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
	  // On se mets à l'écoute du canal de retour
	  var shortTermSubscription = this.centrifugeService.getMessagesOn('$'+this.groupId)
	    .map(message => message['data'])
		.filter( data=> data['cmdline'] && data['cmdline'].indexOf("--list-plugin")>-1)
		.filter( data=> data['terminated'] == 1 ) // Only keep the completed result
		.map( data => data['stdout'])
		.subscribe(
			stdout => this.processPluginList(stdout),
			err  => console.error(err),
			()   => shortTermSubscription.unsubscribe()); // Unsubscribe when we get the message
	  // On on envoie une commande au host
	  this.selectedHost.cmdline = "!check --list-plugin";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  // fills this.plugins with a plugin list : {name, plugin, description}
  // This list is shown to user
  processPluginList(stdout: string[]) {
	  // Display start of step3
	  this.outputStep2 = stdout.slice(2,13).join("\n") + "\n(......)";
	  // PROCESS
	  var pluginRE = /^PLUGIN: (\S+)DESCRIPTION: *(.*?) *$/;
	  this.plugins = stdout.join("").split(/-{5,}/) // chaque plugin est sur une seule ligne
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
						return { name:name,	plugin:plugin, local:local, protocol:protocol, description:description};
					}).filter( plugin => plugin != null );
  }
  
  // USER clicked on a Plugin
  selectPlugin(plugin: any) {
	  this.selectedPlugin = plugin;
	  this.requestPluginModes(plugin);
  }

  // USER clicked on Family/SAVE  
  saveSelectedPluginToFamily() {
	  // Some plugins are both local AND have a protocol (SSH), so there are 2 families to save
	  if (this.selectedPlugin.local) this.saveFamily( new Family( {
			id: this.selectedPlugin.family_id,
			name: this.selectedPlugin.name,
			description: this.selectedPlugin.description,
			local: true,
			protocol: null
	  } ));
	  if (this.selectedPlugin.protocol!=null) this.saveFamily( new Family( {
			id: this.selectedPlugin.family_id,
			name: this.selectedPlugin.name,
			description: this.selectedPlugin.description,
			local: false,
			protocol: this.selectedPlugin.protocol
	  } ));
  }
  
  saveFamily( family: Family ) {
	  this.templatesDataService.insertOrUpdateFamilyByNameLocalProtocol( family )
		.subscribe(family => this.selectedPlugin.family_id = family.id);
  }
  
  // USER clicked on Back
  cancelSelectedPlugin() {
	  this.selectedPlugin = null;
	  this.outputStep4='';
	  this.outputStep5='';
	  this.selectedPluginModes=null;
  }
  
  // Execute    !check --plugin ... --list-mode
  requestPluginModes(plugin) {
	  // On se mets à l'écoute du canal de retour
	  var shortTermSubscription = this.centrifugeService.getMessagesOn('$'+this.groupId)
	    .map(message => message['data'])
		.filter( data=> data['cmdline'] && data['cmdline'].indexOf("--list-mode")>-1)
		.filter( data=> data['terminated'] == 1 ) // Only keep the completed result
		.subscribe(
			data => this.processModes(data['stdout']),
			err  => console.error(err),
			()   => shortTermSubscription.unsubscribe()); // Unsubscribe when we get the message
	  // On envoie une commande au host
	  this.selectedHost.cmdline = "!check --plugin " + plugin.plugin + " --list-mode";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  // extraction of "Modes available" infos...
  processModes(stdout: string[]) {
	  this.outputStep4 = stdout.join("\n");
	  // PROCESS
	  var modesRE = /Modes Available:\s+(.*?) *$/;
	  var groups = modesRE.exec(stdout.join(""));
	  this.selectedPluginModes = groups[1].split(/ +/);
  }
  
  selectMode(mode: string) {
	  // this.selectedMode = mode;
	  this.requestPluginParameters(this.selectedPlugin, mode);
  }
  
  // Execute    !check --plugin ... --mode ... --help
  requestPluginParameters(family, mode) {
	  // On se mets à l'écoute du canal de retour
	  var shortTermSubscription = this.centrifugeService.getMessagesOn('$'+this.groupId)
	    .map(message => message['data'])
		.filter( data=> data['cmdline'] && data['cmdline'].indexOf("--help")>-1)
		.filter( data=> data['terminated'] == 1 ) // Only keep the completed result
		.map( data => data['stdout'].join(";;").replace(/.*;;;;Mode:;;/,"").replace(/;;/g,"\n"))
		.subscribe(
			help => this.processParameters(help),
			err  => console.error(err),
			()   => shortTermSubscription.unsubscribe()); // Unsubscribe when we get the message
	  // On envoie une commande au host
	  this.selectedHost.cmdline = "!check --plugin " + family.plugin + " --mode " + mode + " --help";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  processParameters(stdout: string) {
	  this.outputStep5 = stdout;
  }
  
}
