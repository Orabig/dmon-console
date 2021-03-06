import { Injectable, EventEmitter } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/startWith';

import { CentrifugeService } from './centrifuge.service';
import { SendCommandService } from './send-command.service';
import { AlertService } from './alert.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { OrderManageService } from './order-manage.service';

import { environment } from '../../environments/environment';

import { Host } from '../_models/objects/host';
import { Message } from '../_models/comm/message';
import { ObjectsDataService } from './objects-data.service';


// Le service qui fournit l'état de tous les hosts.
// Il fournit un Observer capable de mettre à jour la liste des hosts
// La valeur initiale est fournie par un appel à l'API (get-group-members),
// puis les valeurs suivantes s'appuient sur le service Centrifuge qui
// mets à jours les hosts

@Injectable()
export class HostService {

  constructor(private httpInterceptorService: HttpInterceptorService,
			  private centrifugeService: CentrifugeService,
			  private alertService: AlertService,
			  private sendCommandService: SendCommandService,
			  private orderManageService: OrderManageService,
        private objectsDataService: ObjectsDataService) { }
  
    // Will emit any received message
	// TODO : Refaire TOUT le modele : ce champ ne devrait pas être static, mais il devient undefined sans explication quand il passe en instance.
	// Pour le moment, ca marche comme ça
    static messageEmitter = new EventEmitter<any>();

	getMessages(): Observable<any> {
	  return HostService.messageEmitter;
	}

	getHosts(groupName: string): Observable<Host[]> {
		  // A l'observable qui émet la liste initiale des hosts ...
		return this.getGroupMembers(groupName)
      // ... On enregistre la liste de ces hosts en passant
      .do(hosts => this.registerHosts(hosts))
		  // ... on combine celui qui modifie ces valeurs
		  .combineLatest( this.centrifugeService.getMessagesOn('$'+groupName)
				.filter(msg => {
					return (! this.shouldMessageBeKnown(msg)) || this.orderManageService.isMessageKnown(msg);
				})
				.startWith( 'NOOP' ) // Il faut simuler un premier message qui duplique la liste initiale
			, this.transformHosts ); // La fonction qui transforme la liste de host avec les messages ultérieurs
	}
	
	// Renvoie un observable contenant la liste (persistée sur le serveur) des hosts d'un groupe
	getGroupMembers(group: string): Observable<Host[]> {
		return this.httpInterceptorService.getJson('get-group-members.php', { group: group} )
	}
	
	// True if that message type must be processed only if known
	// Typically, RESULTS should be known, because they result of a 'CMD' request
	// On the contrary, 'SERVICE' or 'ALIVE' messages must NOT be known to be handled
	shouldMessageBeKnown(message: any) :boolean {
		return message.data['t']==='RESULT';
	}
	
	// Envoie une requete au serveur de demande de token
	getToken(user:string, timestamp:string, info:any):Observable<string>  {
		return this.httpInterceptorService.postJson('token.php', 
			{
			user: user,
			timestamp: timestamp,
			info: info
			} )
			.map(data=>data['token']);
	}
	
	// Transforms the lists of hosts with the message received from Centrifugo.
	transformHosts(hosts, message): Host[] {
		if (message=='NOOP') return hosts; // Le premier message émet la liste de hosts initiale
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
			host.client_id = undefined;
			hosts.push(host);
			hosts = Object.assign( hosts );
      // Record the host in the database if it's not known
      this.getHostIdOrInsert( host );
		}
		return hosts;
	}
  
  registerHosts( hosts:Host[] ) {
    hosts.forEach(host => this.getHostIdOrInsert(host));
  }
  
  getHostIdOrInsert( host:Host ) {
    this.objectsDataService.getHostByName(host.name).subscribe(
      gotHost => {
        if (gotHost===undefined) {
          this.objectsDataService.addHost(host).subscribe(result=>{});
        }else{
          host.id = gotHost.id;
        }
      }
    ); 
  }
}