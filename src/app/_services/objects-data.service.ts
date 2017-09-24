import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Application, Host, Composant, Implantation, Agent, Argument } from '../_models/objects';
import { Technology } from '../_models/templates';

import { generateUUID } from '../_helpers/utils';

// This service contains all Data-Access method for Client-managed objects :
// * Host (TODO)
// * Application
// * ...

// underlying api.php is documented here : https://github.com/mevdschee/php-crud-api

@Injectable()
export class ObjectsDataService {

  constructor(private httpInterceptorService: HttpInterceptorService) { }

  // ------------------------- Application --------------------------
  
  // GET ALL applications from API
  getAllApplications(): Observable<Application[]> {
  return this.httpInterceptorService
      .getJson('api.php/Application', { transform: true, order: 'name' } )
      .map ( response => response['Application'] );
  }
  
  // POST a new application (the returned Observable MUST be subscribed and returns the ID)
  addApplication(application: Application): Observable<Application> {
    var newApplication: Application = Object.assign({}, application, {id: generateUUID()} );    
    return this.httpInterceptorService
        .postJson('api.php/Application', newApplication )
        .map(result => newApplication);
  }

  // DELETE /applications/:id
  deleteApplicationById(id: string): Observable<number> {
    return this.httpInterceptorService
    .deleteJson('api.php/Application', id );
  }

  // PUT /applications/:id
  updateApplicationById(id: string, values: Object = {}): Application {
    console.log("Not implemented");
    return null;
  }

  // GET /applications/:id
  getApplicationById(id: string): Application {
    console.log("Not implemented");
    return null;
  }
  
  // ------------------------- Host --------------------------
  
  // GET ALL hosts from API
  getAllHosts(): Observable<Host[]> {
  return this.httpInterceptorService
      .getJson('api.php/Host', { transform: true, order: 'name' } )
      .map ( response => response['Host'] );
  }
  
  // POST a new host (the returned Observable MUST be subscribed and returns the ID)
  addHost(host: Host): Observable<Host> {  
    var newHost: Host = Object.assign({}, host, {id: generateUUID()});
    return this.httpInterceptorService
        .postJson('api.php/Host', newHost).map( result => newHost );
  }

  // DELETE /hosts/:id
  deleteHost(host: Host): Observable<number> {
    return this.httpInterceptorService
    .deleteJson('api.php/Host', host.id );
  }

  // PUT /hosts/:id
  updateHostById(id: string, values: Object = {}): Host {
    console.error("Not implemented");
    return null;
  }

  // GET /hosts?filter[]=name,eq,XXX&filter[]=attr,eq,YYY
  getHostByName(name: string): Observable<Host> {
    return this.httpInterceptorService
      .getJson('api.php/Host', { transform: true, filter: 'name,eq,'+name } )
      .map ( response => response['Host'][0] );
  }

  // GET /hosts/:id
  getHostById(id: string): Observable<Host> {
    return this.httpInterceptorService
        .getJson('api.php/Host/'+id, { transform: true }); 
  }

  // ------------------------- Composant --------------------------
  
  // Renvoie la liste des composants pour l'application donnée, et le host donné
  // IMPORTANT : Les objets Composant sont renseignés avec leur implantation_id et le host_id
  // pour le hosts demandé, ainsi que l'iconUri de la technologie associée (tech_iconUri)
  // et l'état en temps réel des Agents
  // host OR application MAY BE NULL
  getAllComponentsFor(host:Host, application:Application):Observable<Composant[]> {
	return this.httpInterceptorService
      .getJson('get-composants.php', { host_id: host.id, application_id: application?application.id:null } );
  }
  
  // Gets a Composant (with linked technology object)
  // Syntax : getComposant(composant).subscribe(...)
  getComposantById(id: string) : Observable<Composant> {
	return this.httpInterceptorService
        .getJson('api.php/Composant', { transform: true, filter: 'id,eq,'+id, include: 'Technology' })
		.map(result => result.Composant[0])
		// Transformation du format renvoyée par CRUD-PHP-API
		.map ( composant => {
			composant.technology = composant.Technology[0];
			delete composant.Technology;
			delete composant.technology_id;
			return composant;
		} );
  }
  
  // Creates a new composant linked to the given technology, the application and the host
  // Returns (an observable of) the id of the created component
  createNewComponent(host:Host, application:Application, technology: Technology, name: string): Observable<Composant> {    
    return this.httpInterceptorService.postJson('create-composant.php', {
      host_id: host.id,
      application_id: application.id,
      technology_id: technology.id,
      name: name
    });
  }
  
  // Updates a Composant
  // Syntax : updateComposant(composant, {name: newName, ...}).subscribe(...)
  updateComposant(composant: Composant, update: any) : Observable<Composant> {
	return this.httpInterceptorService
        .putJson('api.php/Composant/'+composant.id, update)
		.map( result => Object.assign({},composant,update) ); 
  }
  
  // Creates a new Implantation (Composant <-> Host) and returns the component object
  // along with the host_id and implantation_id
  assignComponentToHost(composant: Composant, host_id: string): Observable<Composant> {
    var newImplantationId = generateUUID();
    var implantation = {
      id: newImplantationId,
      composant_id: composant.id,
      host_id: host_id
    }
    return this.httpInterceptorService
        .postJson('api.php/Implantation', implantation)
        .map(result => Object.assign({}, composant, {implantation_id: newImplantationId, host_id: host_id}));
  }
  
  // Creates a new Dependency (Composant <-> Application) and returns the component object itself
  assignComponentToApplication(composant: Composant, application_id: string): Observable<Composant> {
    var dependency = {
      composant_id: composant.id,
      application_id: application_id
    }
    return this.httpInterceptorService
        .postJson('api.php/Dependency', dependency)
        .map(result => composant);
  }
  
  // ------------------------- Implantation --------------------------
  
  // Gets an Implantation (containing its Agents)
  // Syntax : getImplantationId(host_id, composant_id).subscribe(...)
  getImplantation(host_id: string, comp_id: string) : Observable<Implantation> {
	return this.httpInterceptorService
        .getJson('api.php/Implantation', { transform: true, 
				include: 'Agent,Argument,Command',
				'filter[]':
					[ 'host_id,eq,'+host_id,
					  'composant_id,eq,'+comp_id
					 ]  })
				.map( comp => comp['Implantation'][0] )
				.map( impl => {
					impl.agents = impl.Agent;
					delete impl.Agent;
					impl.agents.forEach(agent => {
						agent.command = agent.Command[0];
						delete agent.Command;
						agent.arguments = agent.Argument;
						delete agent.Argument;
					});
					return impl;
				}	); 
  }
  
  getHostsForComposant(comp_id: string) : Observable<Host[]> {
	return this.httpInterceptorService
        .getJson('get-hosts-for-composant.php', { composant_id: comp_id });
  }
  
  // Deletes an Implantation. If this was the last implantation, then delete the composant
  deleteComponent(application:Application, host:Host, composant: Composant): Observable<number> {    
    return this.httpInterceptorService.postJson('delete-implantation.php', {
      host_id: host.id,
      application_id: application.id,
      composant_id: composant.id
    });
  }

  // ------------------------- Agent --------------------------

  // Creates a new agent
  // Returns (an observable of) the agent
  createNewAgent(agent: Agent): Observable<Agent> {    
    var newAgentId = generateUUID();
    var newAgent: Agent = Object.assign({}, agent, 
		{id: newAgentId, command_id: agent.command.id, Argument: agent.arguments});
	delete newAgent.arguments;
	delete newAgent.command;
    return this.httpInterceptorService
        .postJson('api.php/Agent', newAgent)
				.do( result => // Il faut aussi créer les arguments (en asynchrone seulement)
					agent.arguments.forEach(
						arg => this.insertArgument(newAgentId, arg).subscribe( ok => {} ) 
					)
				)
				.map( result => newAgent )
		;
  }
  
  updateAgent(agent: Agent): Observable<Agent> {    
    var updAgent: Agent = Object.assign({}, agent, 
		{command_id: agent.command.id, Argument: agent.arguments});
	delete updAgent.arguments; // TODO : les arguments ne sont PAS mis à jour. Il faut le faire à la main)
	delete updAgent.command;
    return this.httpInterceptorService
        .putJson('api.php/Agent/'+agent.id, updAgent)
		.do ( result =>
			// Suppression des variables qui n'existent plus
			this.deleteArgumentsNotInAsync(agent)
		).do ( result =>
			// update des variables
			this.insertOrUpdateArgumentsInAsync(agent)
		)
		.map( result => agent );
  }
 

  // ------------------------------- Argument ---------------------------------
  
  getArgumentByName(agentId: string, name: string): Observable<Argument> {
	  return this.httpInterceptorService
				.getJson('api.php/Argument', { transform: true, 'filter[]': 
					["agent_id,eq," + agentId,
					 "variable_name,eq," + name
					 ] } )
				.map ( response => response['Argument'][0] );
  }
  
  deleteArgumentsNotInAsync(agent: Agent) {
	  this.httpInterceptorService
				.getJson('api.php/Argument', { transform: true, 'filter': "agent_id,eq," + agent.id } ) // Lecture de toutes les arguments
				.map(response => response['Argument'])
				.subscribe(args =>
					args.filter( // ne garder que celle qui ne sont pas dans l'agent
						argument=>agent.arguments.filter(cvar=>cvar.variable_name==argument.variable_name).length==0 )
						.forEach( // Pour chacune, envoyer un ordre de suppression
						argument=>this.httpInterceptorService
							.deleteJson('api.php/Argument', argument.id ).subscribe(ok=>{})
						)
				);
  }
  
  // Update the arguments (asynchronously)
  insertOrUpdateArgumentsInAsync(agent: Agent) {
	  console.log("insertOrUpdateArgumentsInAsync",agent.arguments);
	  agent.arguments.forEach(argument=>
	    this.getArgumentByName(agent.id, argument.variable_name)
				.subscribe(original => { // Si un argument du même nom existe, on le mets à jour
					if (original!=null) {
						this.httpInterceptorService
							.putJson('api.php/Argument/'+original.id, Object.assign({},argument,{id:original.id}))
							.subscribe(ok=>{})
					} else { // Sinon, on le crée
						this.insertArgument(agent.id, argument)
							.subscribe(ok=>{})
					}
					}
				)
	  );
  }
  
  insertArgument(agentId: string, argument: Argument): Observable<Argument> {
	  var newArgumentId = generateUUID();
	  return this.httpInterceptorService
				.postJson('api.php/Argument', Object.assign(argument, {id: newArgumentId, agent_id: agentId}) )
				.map( result => Object.assign({}, argument, {id: newArgumentId}) );
  }
   
}