import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Application } from '../_models/objects';

// This service contains all Data-Access method for Client-managed objects :
// * Host (TODO)
// * Application
// * ...

@Injectable()
export class ObjectsDataService {

  constructor(private httpInterceptorService: HttpInterceptorService) { }

  // ------------------------- Application --------------------------
  
  // GET ALL applications from API
  getAllApplications(): Observable<Application[]> {
	return this.httpInterceptorService
			.getJson('api.php/Application', { transform: true} )
			.map ( response => response['Application'] );
  }
  
  // POST a new application (the returned Observable MUST be subscribed and returns the ID)
  addApplication(application: Application): Observable<string> {	  
	  return this.httpInterceptorService
				.postJson('api.php/Application', application );
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

}