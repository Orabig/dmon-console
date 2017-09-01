import { EventEmitter } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

declare var Centrifuge: any;

export class CentrifugeService {
	private handler: any;
	private debug: boolean;
	private connected = false;
  
  stateEmitter = new EventEmitter<any>();
  
  getStates(): Observable<any> {
	  return this.stateEmitter;
  }
  
    messageEmitter = new EventEmitter<any>();

	getMessages(): Observable<any> {
	  return this.messageEmitter;
	}
  
  connect(parameters: any): void {
	if (this.connected) {
		throw new Error('Centrifuge is already connected.');
	}
	this.handler = new Centrifuge( parameters );
	this.debug = parameters.debug;
	var self = this;
	this.handler
		.on('connect', function(data) {
			this.connected = true;
			if (self.debug) { console.log("Connected to Centrifugo",data); }
			self.stateEmitter.emit({type:'state',state:'connected',info:data});
		}).on('disconnect', function(data) {
			this.connected = false;
			if (self.debug) { console.log("Disconnected from Centrifugo",data); }
			self.stateEmitter.emit({type:'state',state:'disconnected',info:data});
			delete this.handler;
		}).on('error', function(error) {
			if (self.debug) { console.error("Error Centrifugo :",error ); }
			self.stateEmitter.emit({type:'error',info:error});
		});
		
	this.handler.connect();
  }
  
  disconnect(): void {
	this.handler.disconnect();
  }
  
  getMessagesOn(channel: string): Observable<any> {
	var subscription = this.handler.subscribe(channel);
	var self = this;

	subscription.on("subscribe", function(data) {
			if (self.debug) { console.log("Subscribed to '"+channel+"' :", data); }
		});
	subscription.on("error", function(error) {
			if (self.debug) { console.log("Centrifugo Subscribe error :", error); }
			self.stateEmitter.emit({type:'error',info:error});
		});
	var messages = Observable.fromEvent(subscription, 'message');
	messages.subscribe(msg => this.messageEmitter.emit(msg));
	return messages;
  }
}