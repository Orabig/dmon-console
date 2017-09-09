import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Application, Host, Composant } from '../_models/objects';
import { Technology } from '../_models/templates';

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
  
  // ------------------------- Host --------------------------
  
  // GET ALL hosts from API
  getAllHosts(): Observable<Host[]> {
  return this.httpInterceptorService
      .getJson('api.php/Host', { transform: true} )
      .map ( response => response['Host'] );
  }
  
  // POST a new host (the returned Observable MUST be subscribed and returns the ID)
  addHost(host: Host): Observable<string> {    
    return this.httpInterceptorService
        .postJson('api.php/Host', host );
  }

  // DELETE /hosts/:id
  deleteHostById(id: string): Observable<number> {
    return this.httpInterceptorService
    .deleteJson('api.php/Host', id );
  }

  // PUT /hosts/:id
  updateHostById(id: string, values: Object = {}): Host {
    console.log("Not implemented");
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
    console.log("Not implemented");
    return null;
  }

  // ------------------------- Composant --------------------------
  
  getAllComponentsFor(host:Host, application:Application):Observable<Composant[]> {
    return this.httpInterceptorService
      .getJson('get-composants.php', { host_id: host.id, application_id: application.id } );
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
  
  // Deletes a composant. Returns the number of affected rows (should be >1)
  deleteComponent(composant: Composant): Observable<number> {    
    return this.httpInterceptorService.postJson('delete-composant.php', {
      composant_id: composant.id
    });
  }
}