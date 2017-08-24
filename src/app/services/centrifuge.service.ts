import { EventEmitter } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import { Host } from '../model/host';

declare var Centrifuge: any;

export class CentrifugeService {
  private handler: any;
  private wsURL = 'http://centrifugo.crocoware.com:8000/connection';
  
  stateEmitter = new EventEmitter<any>();
  
  constructor() {
	this.handler = new Centrifuge({
		url: this.wsURL,
		user: 'First_User_12345',
		timestamp: "1503256116",
		info: '{"class":"console"}',
		token: "aae0cd7e7f8d0b8f178c1d577cbd7141eb2f404330479c0fb836ac990bd3003b",
		debug: "true",
		authEndpoint: "http://centrifugo.crocoware.com:9191/api/auth.php"
	});
	var self = this;
	this.handler
		.on('connect', function(data) {
			console.log("Connected to Centrifugo",data);
			self.stateEmitter.emit({state:'connected',info:data});
		}).on('disconnect', function(data) {
			console.log("Disconnected from Centrifugo",data);
			self.stateEmitter.emit({state:'disconnected',info:data});
		}).on('error', function(error) {
			console.log("Error Centrifugo :",error );
			self.stateEmitter.emit({state:'error',info:error});
			// TODO : je suis arrivé ici après avoir coupé le PC. Pas d'affichage. Fix req
		});
		
	this.handler.connect();
  }
  
  getStates(): Observable<any> {
	  return this.stateEmitter;
  }
  
  getMessages(channel: string): Observable<any> {
	var subscription = this.handler.subscribe(channel);
		
	subscription.on("subscribe", function(data) {
			console.log("Subscribed to '"+channel+"' :", data);
		});
	subscription.on("error", function(error) {
			console.log("Centrifugo Subscribe error :", error);
			// TODO : je suis arrivé ici après avoir coupé le PC. Pas d'affichage. Fix req
		});
	return Observable.fromEvent(subscription, 'message');
  }
}