import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HttpInterceptorService } from './http-interceptor.service';

import { Application, Host, Composant } from '../_models/objects';
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
  
  // Renvoie la liste des composants pour l'application donnée, et le host donné
  // IMPORTANT : Les objets Composant sont renseignés avec leur implantation_id et le host_id
  // pour le hosts demandé, ainsi que l'iconUri de la technologie associée (tech_iconUri)
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
  
  // Deletes an Implantation. If this was the last implantation, then delete the composant
  deleteComponent(application:Application, host:Host, composant: Composant): Observable<number> {    
    return this.httpInterceptorService.postJson('delete-implantation.php', {
      host_id: host.id,
      application_id: application.id,
      composant_id: composant.id
    });
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
}