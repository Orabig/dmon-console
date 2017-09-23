import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';

import { ObjectsDataService, TemplatesDataService, CentrifugeService, HostService, GroupService, SendCommandService } from '../_services/index';
import { environment } from '../../environments/environment';

import { User } from '../_models/users';
import { Family, Command, Variable } from '../_models/templates';
import { Host, Composant, Implantation, Agent, Argument } from '../_models/objects';

import { generateUUID } from '../_helpers/utils';
import { buildCommandLine } from '../_helpers/rules';

@Component({
  templateUrl: './page-implantation.component.html',
  styleUrls: ['./page-implantation.component.css'],
  providers: [ GroupService ]
})
export class PageImplantationComponent implements OnInit, OnDestroy {

  // Trick to be able to iterate on Hash with *ngFor
  objectKeys = Object.keys;
  
  connectionState: string;
  private groupId: string;
  private user: User;
  private localHosts: Host[];
  private otherHosts: Host[];

  selectedHost: Host;
  composant: Composant;
  implantation: Implantation;
  
  // The list of all (not empty) families. This array won't change and is the "sum" of the 2 others
  private families: Family[]; // familyID=>family
  // The list of selected family IDs (showing in "list of checks")
  private selectedFamilies: number[];
  // The list of selected family IDs (showing in "drag a familiy")
  private unselectedFamilies: number[];
  
  private checksByFamilies: Agent[][] = [];
  
  // An array [ string=>boolean ] telling if the commands are shown (and thus draggable) for the given family ID
  private commandsShown: any[] = [];
  private values: string[] = [];
  
  // The agent currently selected and in edition mode
  private selectedAgent: Agent;
  private cmdLine: string;
  private result;
  
  // The command objects (with all properties, requirements AND variables) used for the edition box
  private editCommandTemplate: Command;
  private editSimpleVariablesTemplate: Variable[];
  private editAdvancedVariablesTemplate: Variable[];
  private editProtocolVariablesTemplate: Variable[];  
  
  constructor(  private objectsDataService: ObjectsDataService,
				private templatesDataService: TemplatesDataService,
				private activatedRoute: ActivatedRoute,
				private hostService: HostService,
				private centrifugeService: CentrifugeService,
				private sendCommandService: SendCommandService,
				private groupService: GroupService) {
	  activatedRoute.paramMap.subscribe(params=> // Will call "load" every time the route changes
		this.load(params.get('hostid'),params.get('composantid')));
	}

  ngOnInit() {
    this.initCentrifuge();
	this.getDefaultGroup(); // Pour le moment, on utilise un groupe unique de hosts.
  }
  
  ngOnDestroy(): void {
	  this.centrifugeService.disconnect();
  }
  
  initCentrifuge() {
	  var user=JSON.parse(localStorage.getItem('currentUser')) as User;
	  this.user=user;
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
  
  // ngOnInit >> Trouver le groupe par défaut de l'utilisateur
  getDefaultGroup() {
    this.groupService.getGroups(this.user.organization.id)
		.subscribe(groups => this.setGroup(groups['default']));
  }
  
  // ngOnInit >> getDefaultGroup >> Le groupe a été récupéré, il faut maintenant interroger la liste des membres qui en font partie
  setGroup(id:string) {
	  this.groupId = id;
	  // TODOTODOTODOTODOTODO : ici , erreur recurrente dans getMessagesOn (cent:58)
  	  this.hostService.getHosts(this.groupId) // Permet de connaitre les hosts avec l'agent ainsi que leur client-id
		.subscribe(hosts => this.localHosts=hosts);
  }
  
  // Is called once from constructor
  loadFamilies(list: Family[]) {
	  this.families=[];
	  list.forEach(f => this.families[f.id]=f); // This will store the entiere list of families indexed by ID
	  this.cleanSelectedFamilies();
  }
  
  // Is called each time the route changes (or on first load)  
  load(hostid:string, compid:string) {
	// Load all families...
	this.templatesDataService.getAllFamilies()
		.subscribe(
		fams => {
			console.log(">>>>>>>>> loadFamilies:",fams);
			this.loadFamilies(fams.filter(family=>family.commands.length>0));
			// Then load the rest
			console.log(">>>>>>>>> and the rest");
			this.objectsDataService.getHostById(hostid).subscribe(host=>this.selectedHost=host);
			this.objectsDataService.getComposantById(compid).subscribe(comp=>this.composant=comp);
			this.objectsDataService.getImplantation(hostid,compid).subscribe(impl=>this.loadImplantation(impl));
			this.objectsDataService.getHostsForComposant(compid).subscribe(hosts=>this.otherHosts = hosts ); // for title display and easy navigation
		}
	);
  }
  
  loadImplantation(impl: Implantation) {
	  this.implantation = impl;
	  // This object comes with the list of known agents
	  impl.agents.forEach(agent => this.selectAgent(agent));
  }
  
  // Show the agent in the list of agents for the given family
  selectAgent(agent: Agent) {
	var family=this.families[agent.family_id];
	var familyId=agent.family_id;
	var actuals = this.checksByFamilies[familyId];
	if (!actuals) actuals = [];
	actuals.push(agent);
	var newValue = [];
	newValue[familyId] = actuals;
	this.checksByFamilies=Object.assign(this.checksByFamilies, newValue);
	// The family must be shown in the list of check, so update selectedFamilies
	this.selectFamily(family);
  }
  
  // Resets the (un)selectedFamilies into initial state (all unselected)
  cleanSelectedFamilies() {
	this.selectedFamilies=[];
	this.unselectedFamilies=[];
	this.objectKeys(this.families).forEach((id)=>this.unselectedFamilies[id]=1);
	this.checksByFamilies=[];
  }
  
  selectFamily(family: Family) {
	var familyId=family.id;
	if (! this.isFamilySelected(familyId)) {
		this.selectedFamilies[familyId]=1;
		delete this.unselectedFamilies[familyId];
		// Refresh lists for display
		this.selectedFamilies=Object.assign({},this.selectedFamilies);
		this.unselectedFamilies=Object.assign({},this.unselectedFamilies);
	}
  }
  
  dropFamily(familyId) {
	var family=this.families[familyId];
	this.selectFamily(family);
  }
  
  // returns true if the given family is selected (means that it is know to belong to the list of
  // checks for this implementation
  isFamilySelected(family_id: number) : boolean{
	  return this.selectedFamilies[family_id]==1;
  }
  

  // Displays the list of available command for the given family, and hides all the others (hide all if family==null)
  toggleAddCommand(family: Family) {
	  var newValue = [];
	  if (family!=null)
		newValue[family.id] = true;
	  this.commandsShown=Object.assign({}, newValue);
  }
  
  // Loads the command (and variables) from its id, sorts the variables and store it into the template
  loadCommandTemplate(id: number): Observable<Command> {
	  return  this.templatesDataService.getCommandById( id )
		.do( fullCommand => {		  
		  this.editCommandTemplate = fullCommand;
		  this.editSimpleVariablesTemplate = this.getSimpleVariables(fullCommand);
		  this.editAdvancedVariablesTemplate = this.getAdvancedVariables(fullCommand);
		  this.editProtocolVariablesTemplate = this.getProtocolVariables(fullCommand);
		});
  }

  // Displays an existing agent in the edition box
  editAgent(agent: Agent) {
	  this.toggleAddCommand(null);
	  this.cleanEditBox();
	  this.loadCommandTemplate(agent.command.id).subscribe( fullCommand => {
		  this.selectedAgent = agent;
		}
	  );	  
  }

  // Creates a new agent and displays it in the edition box
  editNewAgent(family: Family, command: Command) {
	  this.toggleAddCommand(null);
	  this.cleanEditBox();
	  this.loadCommandTemplate(command.id).subscribe( fullCommand => {
		  this.selectedAgent = new Agent(
			{	command: command, 
				family_id: family.id, 
				implantation_id: this.implantation.id, 
				name: command.name });
		}
	  );	  
  }
  
  cleanEditBox() {
	  this.result=null;
	  this.cmdLine=null;
	  this.values = [];
  }
  
  // Gets the values in the inputs and stores them in the agent object
  fillAgentWith( agent: Agent, values: string[] ) {
	  agent.arguments = Object.keys(values)
						.filter(name => values[name] != "")
						.map(name => new Argument({name:name, 'variable_id': this.getVariableId(agent,name), value: values[name]}));
  }
  
  getVariableId(agent: Agent, name: string) {
	  // La commande de l'agent correspond à this.editCommandTemplate
	  if (this.editCommandTemplate.id != agent.command.id) {
			throw("Strange state for editor");
	  }
	  // Donc on peut connaitre les variables à partir de cette commande
	  return this.editCommandTemplate.variables
		.filter(variable => variable.name==name)[0].id;
  }
  
  // Build the command line and executes it
  testAgent(agent: Agent) {
	  this.fillAgentWith( agent, this.values );
	  this.cmdLine = buildCommandLine(agent, this.editCommandTemplate);
	  agent.computedCmdLine = this.cmdLine;
	  this.getResultFromSelectedHost(this.cmdLine).subscribe(
		result => this.result=result
	  );
  }
  
  registerAgent(agent: Agent) {
	  this.testAgent(agent)
	  if (agent.id) {
		  this.objectsDataService.updateAgent(agent).subscribe(res => console.log("up:",res));
	  } else {
		  this.objectsDataService.createNewAgent(agent).subscribe(res => { 
		  console.log("cr:",res); 
		  agent.id=res.id; 
		  // Afficher dans la liste des agents connus par famille
		  if (!this.checksByFamilies[agent.family_id]) {
			this.checksByFamilies = Object.assign( {}, this.checksByFamilies);
			this.checksByFamilies[agent.family_id] = [];
		  }
		  this.checksByFamilies[agent.family_id].push(agent); 
		  // Enregistrer le check dans le client		  
		  this.sendCommandService.sendRegister(this.selectedHost,agent.id,agent.computedCmdLine);
		  });
	  }
  }
  
  // ---------------------------------------------------------
  // function for manipulation of template variables
  
  getSimpleVariables(command: Command): Variable[] {
	  return command.variables
		.filter(variable => ! variable.protocol_variable && ! variable.advanced_variable)
		.sort((v1,v2)=> v1.position - v2.position);
  }
  getAdvancedVariables(command: Command): Variable[] {
	  return command.variables
		.filter(variable => variable.advanced_variable)
		.sort((v1,v2)=> v1.position - v2.position);
  }
  getProtocolVariables(command: Command): Variable[] {
	  return command.variables
		.filter(variable => variable.protocol_variable)
		.sort((v1,v2)=> v1.position - v2.position);
  }
  
 
  // ------------------------- Utility method (used several times here)
  // TODO : taken from page-plugin-discovery.component : Factorize (and put in centrifugoService or sendCommandService ????)
  
  getResultFromSelectedHost(cmdline: string): Observable<any> {
	  var cmdId = generateUUID();
	  // Extract the hostTarget from the known host list (so that we know its client-id)
	  // TODO : Ici, localHosts peut ne pas être défini : vérifier
	  var localHostTarget = this.localHosts.filter(host => host.name==this.selectedHost.name);
	  if (localHostTarget.length==0) {
		  throw("This host is unknown or not local : "+this.selectedHost.name);
	  }
	  this.selectedHost.client = localHostTarget[0].client;
	  
	  // On s'enregistre au groupe par défaut (le host appartient à ce groupe)
	  // TODO : ca serait peut-être mieux de s'enregistrer directement sur les résultats du host seulement	  
	  var observable = this.centrifugeService.getMessagesOn('$'+this.groupId)
	    .map(message => message['data'])
		.filter( data=> data['cmdId']==cmdId && data['t']=='RESULT' )
		.skipWhile( data=> data['terminated'] == 0 ) // Only keep the completed result
		.take(1);
	  // On envoie la commande au host
	  // TODO : il faut peut-être attendre que l'enregistrement au channel soit ok ?
	  this.sendCommandService.sendCommandLineWithId(this.selectedHost,cmdId,cmdline);  
	  return observable;
  }
}
