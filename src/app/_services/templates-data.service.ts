import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Family, Technology, Command, Variable } from '../_models/templates';

// This service contains all Data-Access method for Templates objects :
// * Technology
// * Family
// * Check
// * Variable
// * Coverage

@Injectable()
export class TemplatesDataService {

  constructor(private httpInterceptorService: HttpInterceptorService) { }
  
  private protocols: any[]; // {id:id, name: name}

  // ------------------------- Technology --------------------------
  
  // GET ALL technologies from API
  getAllTechnologies(): Observable<Technology[]> {
	return this.httpInterceptorService
			.getJson('api.php/Technology', { transform: true} )
			.map ( response => response['Technology'] );
  }
  
  // POST a new technology (the returned Observable MUST be subscribed and returns the ID)
  addTechnology(technology: Technology): Observable<number> {	  
	  return this.httpInterceptorService
				.postJson('api.php/Technology', technology );
  }

  // DELETE /technologies/:id
  deleteTechnologyById(id: number): Observable<number> {
	  return this.httpInterceptorService
		.deleteJson('api.php/Technology', id );
  }

  // PUT /technologies/:id
  updateTechnologyById(id: number, values: Object = {}): Technology {
	  console.log("Not implemented");
	  return null;
  }

  // GET /technologies/:id
  getTechnologyById(id: number): Technology {
	  console.log("Not implemented");
	  return null;
  }

  // ------------------------- Family --------------------------
  
  // GET ALL families from API with linked protocols, technologies and commands
  getAllFamilies(): Observable<Family[]> {
	return this.httpInterceptorService
			.getJson('api.php/Family', { transform: true, include: 'Protocol,Technology,Command' } )
			.map ( response => response['Family'] )
			// Transformation du format renvoyée par CRUD-PHP-API
			.map ( families => families.map( family=> {
				// Protocol[] -> protocol
				family.protocol = family.Protocol[0];
				delete family.Protocol;
				delete family.protocol_id;
				// Command[] -> commands[]
				family.commands = family.Command;
				delete family.Command;
				return family;
			}) );
  }
  
  // GET families with the given name (with protocol name in 'protocol' field)
  getFamiliesByName(name: string): Observable<Family[]> {
	return this.httpInterceptorService
			.getJson('api.php/Family', { transform: true, include: 'Protocol', filter: 'name,eq,'+name } )
			.map ( response => response['Family'] )
			// Transformation du format renvoyée par CRUD-PHP-API
			.map ( families => families.map( family=> {
				// Protocol[] -> protocol
				family.protocol = family.Protocol[0] ? family.Protocol[0].name : null;
				delete family.Protocol;
				delete family.protocol_id;
				return family;
			}) );
  }
  
  // POST a new family (the returned Observable MUST be subscribed and returns the ID)
  insertFamily(family: Family): Observable<Family> {	  
	  return this.httpInterceptorService
				.postJson('api.php/Family', family )
				.map( id => Object.assign({}, family, {id: id}) );
  }

  // DELETE /families/:id
  deleteFamilyById(id: number): Observable<number> {
	  return this.httpInterceptorService
		.deleteJson('api.php/Family', id );
  }

  // PUT /families/:id
  updateFamily(family: Family, update: any): Observable<Family> {
	return this.httpInterceptorService
			.putJson('api.php/Family/'+family.id, update)
			.map( result => Object.assign({},family,update) ); 
  }

  // INSERT OR UPDATE /families/:name,:local,:protocol
  insertOrUpdateFamilyByNameLocalProtocol(family: Family): Observable<Family> {
	  return this.getProtocolId(family['protocol'])
		.flatMap(protocolId => {
			  delete family['protocol'];
			  family['protocol_id']=protocolId;
			  
			  if (family.id != null) { // L'ID est déjà connu, on fait un update
				return this.updateFamily(family, family);
			  }
			  // On cherche si le name(family) existe déjà
			  return this.getFamilyByNameLocalProtocolId(family)
				.flatMap(original => {
					if (original && original.id != null) { // On a récupéré l'ID
						return this.updateFamily(original, family);
					} else {
						return this.insertFamily(family);
					}
				});
	});
  }

  // GET /families/:id
  getFamilyByNameLocalProtocolId(filter: any): Observable<Family> {
	var protocolOp = filter.protocol_id==null ? 'is' : 'eq'; // API needs 'field,is,null' syntax
	var local = filter.local ? 1 : 0; // API does not support boolean in filter[]
	return this.httpInterceptorService
				.getJson('api.php/Family', { transform: true, 'filter[]': 
					["name,eq," + filter.name, 
					 "local,eq," + local,
					 "protocol_id," + protocolOp + "," + filter.protocol_id
					 ] } )
				.map ( response => response['Family'][0] );
  }

  // ------------------------------- Variable ---------------------------------
  
  getVariableByName(familyId: number, commandId: number, variable: Variable): Observable<Variable> {
	  return this.httpInterceptorService
				.getJson('api.php/Variable', { transform: true, 'filter[]': 
					["family_id,eq," + familyId,
					 "command_id,eq," + commandId,
					 "name,eq," + variable['name']
					 ] } )
				.map ( response => response['Variable'][0] );
  }
  
  deleteVariablesNotInAsync(command: Command) {
	  this.httpInterceptorService
				.getJson('api.php/Variable', { transform: true, 'filter[]': 
					["family_id,eq," + command.family_id,
					"command_id,eq," + command.id] } ) // Lecture de toutes les variables
				.map(response => response['Variable'])
				.subscribe(variables =>
					variables.filter( // ne garder que celle qui ne sont pas dans la commande
						variable=>command.variables.filter(cvar=>cvar.name==variable.name).length==0 )
						.forEach( // Pour chacune, envoyer un ordre de suppression
						variable=>this.httpInterceptorService
							.deleteJson('api.php/Variable', variable.id ).subscribe(ok=>{})
						)
				);
  }
  
  // Update the variables (asynchronously)
  insertOrUpdateVariablesInAsync(command: Command) {
	  command.variables.forEach(variable=>
	    this.getVariableByName(command.family_id, command.id, variable)
				.subscribe(original => {
					if (original!=null) {
						this.httpInterceptorService
							.putJson('api.php/Variable/'+original.id, Object.assign({},variable,{id:original.id}))
							.subscribe(ok=>{})
					} else {
						this.insertVariable(command.family_id, command.id, variable)
							.subscribe(ok=>{})
					}
					}
				)
	  );
  }
  
  insertVariable(familyId: number, commandId: number, variable: Variable): Observable<Variable> {
	  return this.httpInterceptorService
				.postJson('api.php/Variable', Object.assign(variable, {family_id: familyId, command_id: commandId}) )
				.map( id => Object.assign({}, variable, {id: id}) );
  }
  
  // ------------------------------- Command ---------------------------------
  
  // GET Full command from API with linked requirements and variable
  getCommandById(id: number): Observable<Command> {
	  return this.httpInterceptorService
				.getJson('api.php/Command', {
					transform: true, 
					filter: "id,eq," + id,
					include: 'Requirement,Variable'
					} )
				.map ( response => response['Command'][0] )
				.map ( command => {
				// Variable[] -> variables[]
				command.variables = command.Variable;
				delete command.Variable;
				// Requirement[] -> requirements[]
				command.requirements = command.Requirement;
				delete command.Requirement;
				return command;
				});
  }
  
  getCommandByName( command: Command): Observable<Command> {
	  return this.httpInterceptorService
				.getJson('api.php/Command', {
					transform: true, 'filter[]': 
					["family_id,eq," + command['family_id'],
					 "name,eq," + command['name']
					 ] } )
				.map ( response => response['Command'][0] );
  }
  
  insertCommand(command: Command): Observable<Command> {
	  return this.httpInterceptorService
				.postJson('api.php/Command', command)
				.do( id => 
					command.variables.forEach(
						variable => this.insertVariable(command.family_id, id, variable).subscribe( ok => {} ) 
					)
				)
				.map( id => Object.assign(command, {id: id}) );
  }
  
  updateCommand(command: Command): Observable<Command> {
	  return this.httpInterceptorService
				.putJson('api.php/Command/'+command.id, command)
				.do ( result =>
					// Suppression des variables qui n'existent plus
					this.deleteVariablesNotInAsync(command)
				).do ( result =>
					// update des variables
					this.insertOrUpdateVariablesInAsync(command)
				)
				.map( result => command );
  }
  
  // Insert a new command (and its variables) or if a command with same family_id and same name exist, updates it
  // IMPORTANT : The id of the parameter is changed after the call of this method (but the ids of the variables are NOT)
  insertOrUpdateCommandByName(command: Command): Observable<Command> {
	// On cherche si le name(command) existe déjà
	return this.getCommandByName(command)
		.flatMap(original => {
			if (original && original.id!=null) {
				return this.updateCommand(Object.assign(command, {id: original.id}));
			} else {
				return this.insertCommand(command);
			}
		})
  }
  
  // ------------------------------- Protocols ---------------------------------

  getProtocolId(name: string): Observable<number> {
	  if (name==null) return Observable.of(null);
	  return this.getProtocols()
		.flatMap(protocols => {
			var found = protocols.filter(protocol => protocol.name == name);
			if (found[0]) return Observable.of(found[0].id);
			// The protocol does not exist, so we should insert it
			return this.insertProtocol({name: name});
 	  });
  }
  
  insertProtocol(protocol: any) {
	  return this.httpInterceptorService
				.postJson('api.php/Protocol', protocol )
				.do( id => this.protocols.push( Object.assign( {id:id}, protocol )) );
  }
  
  getProtocols(): Observable<any[]> {
	  if (this.protocols != null) {
		  return Observable.of( this.protocols );
	  }else {
		return this.httpInterceptorService
			.getJson('api.php/Protocol', { transform: true } )
			.map ( response => response['Protocol'] )
			.do( protocols => this.protocols = protocols );
	  }
  }
}