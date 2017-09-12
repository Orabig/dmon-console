import { Component, OnInit } from '@angular/core';
import { Host } from '../_models/objects/index';
import { User } from '../_models/users/user';
import { ObjectsDataService, CentrifugeService, HostService, GroupService, SendCommandService, HttpInterceptorService } from '../_services/index';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-page-plugin-discovery',
  templateUrl: './page-plugin-discovery.component.html',
  styleUrls: ['./page-plugin-discovery.component.css'],
  providers: [ GroupService ]
})
export class PagePluginDiscoveryComponent implements OnInit {

  hosts: Host[] = [];
  selectedHost: Host;
  connectionState: string;
  user: User;
  groupId: string;
  shortTermSubscription: any;
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
  
  requestPluginList() {
	  var groupId = this.groupId;
	  // On se mets à l'écoute du canal de retour
	  this.shortTermSubscription = this.centrifugeService.getMessagesOn('$'+groupId)
		.subscribe(message => this.checkPluginListMessage(message));
	  // On on envoie une commande au host
	  this.selectedHost.cmdline = "!check --list-plugin";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  checkPluginListMessage(message: string) {
	  if (! message['data']['cmdline']) return;
	  if (message['data']['cmdline'].indexOf("--list-plugin")<0) return;
	  if (message['data']['terminated']==0) return;
	  this.shortTermSubscription.unsubscribe();
	  this.processPluginList(message['data']['stdout']);
  }
  
  processPluginList(stdout: string[]) {
	  // Display start of step3
	  this.outputStep2 = stdout.slice(2,13).join("\n") + "\n(......)";
	  // PROCESS
	  var pluginRE = /^PLUGIN: (\S+)DESCRIPTION: *(.*?) *$/;
	  this.plugins = stdout.join("").split(/-{5,}/) // chaque plugin est sur une seule ligne
					.sort()
					.map( line => {
						var match = pluginRE.exec(line); 
						return match ?
							{
								name:match[1], 
								description:match[2].replace(/ +/g," ")
							} : null ;
					}).filter( line => line!=null );
	  					
  }
  
  selectPlugin(plugin: any) {
	  this.selectedPlugin = plugin;
	  this.requestPluginModes(plugin);
  }
  
  cancelSelectedPlugin() {
	  this.selectedPlugin = null;
	  this.outputStep4='';
	  this.outputStep5='';
	  this.selectedPluginModes=null;
  }
  
  // Execute    !check --plugin ... --list-mode
  requestPluginModes(plugin) {
	  var groupId = this.groupId;
	  // On se mets à l'écoute du canal de retour
	  this.shortTermSubscription = this.centrifugeService.getMessagesOn('$'+groupId)
		.subscribe(message => this.checkPluginModesMessage(message));
	  // On envoie une commande au host
	  this.selectedHost.cmdline = "!check --plugin " + plugin.name + " --list-mode";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  checkPluginModesMessage(message: string) {
	  if (! message['data']['cmdline']) return;
	  if (message['data']['cmdline'].indexOf("--list-mode")<0) return;
	  if (message['data']['terminated']==0) return;
	  this.shortTermSubscription.unsubscribe();
	  this.processModes(message['data']['stdout']);
  }
  
  // extraction of "Modes available" infos...
  processModes(stdout: string[]) {
	  console.log("hu?");
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
  requestPluginParameters(plugin, mode) {
	  var groupId = this.groupId;
	  // On se mets à l'écoute du canal de retour
	  this.shortTermSubscription = this.centrifugeService.getMessagesOn('$'+groupId)
		.subscribe(message => this.checkPluginParametersMessage(message));
	  // On envoie une commande au host
	  this.selectedHost.cmdline = "!check --plugin " + plugin.name + " --mode " + mode + " --help";
	  this.sendCommandService.sendCommandLine(this.selectedHost);
  }
  
  checkPluginParametersMessage(message: string) {
	  if (! message['data']['cmdline']) return;
	  if (message['data']['cmdline'].indexOf("--help")<0) return;
	  if (message['data']['terminated']==0) return;
	  this.shortTermSubscription.unsubscribe();
	  var modeDocumentation = message['data']['stdout'].join(";;").replace(/.*;;;;Mode:;;/,"").replace(/;;/g,"\n");
	  this.processParameters(modeDocumentation);
  }
  
  processParameters(stdout: string) {
	  this.outputStep5 = stdout;
  }
  
}
