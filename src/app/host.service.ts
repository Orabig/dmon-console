import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';

import { CentrifugeService } from './centrifuge.service';

import { Host } from './host';
import { Service } from './service';

// Le service qui fournit l'état de tous les hosts.
// Il fournit un Observer capable de mettre à jour la liste des hosts
// La valeur initiale est fournie par un appel à l'API (get-group-members),
// puis les valeurs suivantes s'appuient sur le service Centrifuge qui
// mets à jours les hosts

@Injectable()
export class HostService {
  private apiURL = 'http://centrifugo.crocoware.com:9191/api/get-group-members.php';
  constructor(private http: Http,
			  private centrifugeService: CentrifugeService) {}
  
	getHosts(): Observable<Host[]> {
		return this.http.get(this.apiURL)
		  .map(response => response.json() as Host[])
		  
		  // A l'observable qui émet la valeur initiale, on combine 
		  // celui qui modifie ces valeurs
		  .combineLatest( this.centrifugeService.getMessages() , this.transformHosts )
		  .catch(this.handleError);
	}
	
	// Transforms the lists of hosts with the message received from Centrifugo.
	private transformHosts(hosts, message): Host[] {
		// console.log("Transform message :: ", message);
		var onHost = message.data['host-id'];
		var found = false;
		hosts.forEach(host => {
			 if (host.name === onHost) {
				// console.log("applyMessage :: ", host, message);
				HostService.applyMessage( host, message );
				found = true;
				}
			}
		);
		if (! found) {
			var host=new Host();
			host.name = onHost;
			HostService.applyMessage( host, message );
			host.client="toto";
			hosts += host;
		}
		return hosts;
	}
	
	private static applyMessage(host: Host, message): void {	
		if (message.data['client-id']){
			host.client = message.data['client-id'];
		} else {
			host.client = undefined;
		}
		// console.log(message);
		if (message.data['t']=='SERVICE'){
			var serviceName = message.data['cmdId'];
			var service = new Service();
			service.name=serviceName;
			if (!host.services) {
				host.services = [];
			}
			host.services[serviceName] = service;
			host.services = Object.assign( host.services );
		}
	}
  
	private handleError(error: any): Observable<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Observable.throw(error.message || error);
	}
}