import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http } from '@angular/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';

import { CentrifugeService } from './centrifuge.service';

import { Host } from '../model/host';
import { Service } from '../model/service';

// Le service qui fournit l'état de tous les hosts.
// Il fournit un Observer capable de mettre à jour la liste des hosts
// La valeur initiale est fournie par un appel à l'API (get-group-members),
// puis les valeurs suivantes s'appuient sur le service Centrifuge qui
// mets à jours les hosts

@Injectable()
export class HostService {
  // TODO : reutiliser le service send-command pour envoyer cette requete
  private apiURL = 'http://centrifugo.crocoware.com:9191/api/get-group-members.php';
  constructor(private http: Http,
			  private centrifugeService: CentrifugeService) { }
  
    // Will emit any received message
	// TODO : Refaire TOUT le modele : ce champ ne devrait pas être static, mais il devient undefined sans explication quand il passe en instance.
	// Pour le moment, ca marche comme ça
    static messageEmitter = new EventEmitter<any>();

	getMessages(): Observable<any> {
	  return HostService.messageEmitter;
	}

	getHosts(channel: string): Observable<Host[]> {
		return this.http.get(this.apiURL)
		  .map(response => response.json() as Host[])
		  
		  // A l'observable qui émet la valeur initiale, on combine 
		  // celui qui modifie ces valeurs
		  .combineLatest( this.centrifugeService.getMessages(channel) , this.transformHosts )
		  .catch(this.handleError);
	}
	
	// Transforms the lists of hosts with the message received from Centrifugo.
	private transformHosts(hosts, message): Host[] {
		
		// console.log("Transform message :: ", message);
		var onHost = message.data['host-id'];
		var found = false;
		hosts.forEach(host => {
			 if (host.name === onHost) {
				HostService.applyMessage( host, message );
				found = true;
				}
			}
		);
		if (! found) {
			var host=new Host();
			host.name = onHost;
			HostService.applyMessage( host, message );
			host.client = undefined;
			hosts.push(host);
			hosts = Object.assign( hosts );
		}
		return hosts;
	}
	
	private static applyMessage(host: Host, message): void {
		host.last_message_time = new Date();
		if (message.data['client-id']){
			host.client = message.data['client-id'];
			host.alive = true;
		} else {
			host.client = undefined;
			host.alive = false;
		}
		if (message.data['t']=='SERVICE'){
			var serviceId = message.data['id'];
			var service = new Service();
			service.id=serviceId;
			service.cmdLine=message.data['cmdline'];
			service.last_output=message.data['stdout'][0];
			if (service.last_output) {
				var split = service.last_output.split("|");
				service.last_output = split[0];
				service.last_perfdata = split[1];
				service.last_time = new Date();
			}
			if (!host.services) {
				host.services = [];
			}
			host.services[serviceId] = service;
			host.services = Object.assign( host.services );
		} else if (message.data['t']=='ACK'){
			// ASIS : ACK ignored for now
			// TODO : check ACK
			HostService.messageEmitter.emit(message);
		} else if (message.data['t']=='RESULT'){
			HostService.messageEmitter.emit(message);
			// TODO : check ACK ID (ne prendre en compte QUE les RESULT de NOS commandes) <<<<<<<< IMPORTANT
			console.log(message);
			host.last_stdout = message.data['stdout'].join('\n');
			host.last_stderr = message.data['stderr'].join('\n');
			if (! message.data['terminated']) {
				host.last_stdout += "...";
			}
			if (host.last_stderr === "" && host.last_stdout === "") {
				host.last_stderr="(no output)";
			}
		} else if (message.data['t']=='ALIVE'){
			// ASIS : ALIVE ignored for now
			// TODO : check ALIVE
		} else if (message.data['t']=='UNREGISTERED'){
			HostService.messageEmitter.emit(message);
			console.log(message);
			// Tell the host that the service has been removed
			var id = message.data['id'];
			Host.removeServiceFrom(host,id);
		} else if (message.data['t']=='REGISTERED'){ 
			HostService.messageEmitter.emit(message);
			// Tell the host that the service should be added
			var id = message.data['id'];
			var cmdline = message.data['cmdline'];
			console.log(message);
			Host.addServiceTo(host,id,cmdline);
		} else {
			console.log("Unknown message type : " + message.data['t'],message);
		}
	}
  
	private handleError(error: any): Observable<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Observable.throw(error.message || error);
	}
}