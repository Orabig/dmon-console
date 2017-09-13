import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Family, Technology } from '../_models/templates';

// This service contains all Data-Access method for Templates objects :
// * Technology
// * Family
// * Check
// * Variable
// * Coverage

@Injectable()
export class TemplatesDataService {

  constructor(private httpInterceptorService: HttpInterceptorService) { }

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
  
  // GET ALL tamilies from API
  getAllFamilies(): Observable<Family[]> {
	return this.httpInterceptorService
			.getJson('api.php/Family', { transform: true} )
			.map ( response => response['Family'] );
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

  // INSERT OR UPDATE /families/:plugin
  insertOrUpdateFamilyByPlugin(family: Family): Observable<Family> {
	  var plugin = family.plugin;
	  if (family.id != null) { // L'ID est déjà connu, on fait un update
		return this.updateFamily(family, family);
	  }
	  // On cherche si le plugin(family) existe déjà
	  return this.getFamilyByPlugin(family.plugin)
		.flatMap(original => {
			if (original && original.id != null) { // On a récupéré l'ID
				return this.updateFamily(original, family);
			} else {
				return this.insertFamily(family);
			}
		});
  }

  // GET /families/:id
  getFamilyByPlugin(plugin: string): Observable<Family> {
	  return this.httpInterceptorService
			.getJson('api.php/Family', { transform: true, filter: "plugin,eq," + plugin } )
			.map ( response => response['Family'][0] );
  }

}