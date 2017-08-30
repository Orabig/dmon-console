import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import { Host, Service } from '../_models/objects';
import { Order } from '../_models/comm/order';

import { environment } from '../../environments/environment';

// Le service qui envoie des commandes au serveur

// TODO : reutiliser ce service pour envoyer la commande dans host.service

@Injectable()
export class SendCommandService {
  
  constructor(private http: Http) {}
  
  orderEmitter = new EventEmitter<any>();

  

  // A simple GET request to an URL of the API
  // url is relative to /api/
  // Returns an observable containing the response
  getJson(url: string, data: any): Observable<Response> {
    return this.http.get(
      environment.dmonApiRoot + url,
      {
		  headers: this.jwt(),
		  search: data
	  }
	);
  }

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return headers;
        }
    }
	
  // A simple POST request to an URL of the API
  // url is relative to /api/
  // Returns an observable containing the response
  postJson(url: string, data: any): Observable<Response> {
    return this.http.post(
      environment.dmonApiRoot + url,
      JSON.stringify(data),
      {headers: this.jwt()}
    )
  }
  
  // An observable that emits all orders sent to the clients.  
  getOrders(): Observable<any> {
	  return this.orderEmitter;
  }
  
  // Send an order to a client
  sendOrder(host: Host, args: any): void {
	    var orderLoad = Order.buildOrderLoad('CMD', host, args);
		this.orderEmitter.emit( orderLoad );
		this.postJson("send-order.php", orderLoad ).subscribe();
  }
  
  // Uses this.sendOrder() to send a RUN command
  sendCommandLine(host: Host): void {
	  this.sendOrder(host, {
			cmd: 'RUN',
			args:  {cmdline: host.cmdline}
		});
  }
  
  // Uses this.sendOrder() to send a KILL command
  sendKillOrder(host: Host, cmdId: string): void {
	    this.sendOrder(host, {
			cmd: 'KILL',
			args:  {cmdId: cmdId}
		});
  }
	
  // Uses this.sendOrder() to send a UNREGISTER command
  sendUnregister(host: Host, service: Service): void {
		this.sendOrder(host, {
			cmd: 'UNREGISTER',
			args: {serviceId: service.id}
		});
  }
	
  // Uses this.sendOrder() to send a REGISTER command
  sendRegister(host: Host, serviceId: string, cmdline: string): void {
		this.sendOrder(host, {
			cmd: 'REGISTER',
			args: {id:serviceId, cmdline: cmdline}
		});
  }
	
}