import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http } from '@angular/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';

import { CentrifugeService } from './centrifuge.service';
import { SendCommandService } from './send-command.service';

import { environment } from '../../environments/environment';

import { Host } from '../_models/objects/host';
import { Message } from '../_models/comm/message';

// Le service qui fournit l'état de tous les hosts.
// Il fournit un Observer capable de mettre à jour la liste des hosts
// La valeur initiale est fournie par un appel à l'API (get-group-members),
// puis les valeurs suivantes s'appuient sur le service Centrifuge qui
// mets à jours les hosts

@Injectable()
export class HostService {

  constructor(private http: Http,
			  private centrifugeService: CentrifugeService,
			  private sendCommandService: SendCommandService) { }
  
    // Will emit any received message
	// TODO : Refaire TOUT le modele : ce champ ne devrait pas être static, mais il devient undefined sans explication quand il passe en instance.
	// Pour le moment, ca marche comme ça
    static messageEmitter = new EventEmitter<any>();

	getMessages(): Observable<any> {
	  return HostService.messageEmitter;
	}

	getHosts(channel: string): Observable<Host[]> {
		var groupName = channel.substring(1); // Remove prefix '$'
		return this.sendCommandService.getJson('get-group-members.php', 
			{
			group: groupName
			} )
		  .map(response => response.json() as Host[])
		  
		  // A l'observable qui émet la valeur initiale, on combine 
		  // celui qui modifie ces valeurs
		  .combineLatest( this.centrifugeService.getMessages(channel) , this.transformHosts )
		  .catch(this.handleError);
	}
	
	// Transforms the lists of hosts with the message received from Centrifugo.
	private transformHosts(hosts, message): Host[] {
		var onHost = message.data['host-id'];
		var found = false;
		hosts.forEach(host => {
			 if (host.name === onHost) {
				Message.applyMessage( host, message );
				HostService.messageEmitter.emit(message);
				found = true;
				}
			}
		);
		if (! found) {
			var host=new Host();
			host.name = onHost;
			Message.applyMessage( host, message );
			HostService.messageEmitter.emit(message);
			host.client = undefined;
			hosts.push(host);
			hosts = Object.assign( hosts );
		}
		return hosts;
	}
	
	private handleError(error: any): Observable<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Observable.throw(error.message || error);
	}
}