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
  addFamily(family: Family): Observable<number> {	  
	  return this.httpInterceptorService
				.postJson('api.php/Family', family );
  }

  // DELETE /tamilies/:id
  deleteFamilyById(id: number): Observable<number> {
	  return this.httpInterceptorService
		.deleteJson('api.php/Family', id );
  }

  // PUT /tamilies/:id
  updateFamilyById(id: number, values: Object = {}): Family {
	  console.log("Not implemented");
	  return null;
  }

  // GET /tamilies/:id
  getFamilyById(id: number): Family {
	  console.log("Not implemented");
	  return null;
  }

}