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
  private baseApiURL = environment.dmonApiRoot;
  
  constructor(private http: Http) {}
  
  orderEmitter = new EventEmitter<any>();

  
  headers = new Headers({
    'Content-Type': 'application/json'
  });

  // A simple GET request to an URL of the API
  // url is relative to /api/
  // Returns an observable containing the response
  getJson(url: string, data: any): Observable<Response> {
    return this.http.get(
      this.baseApiURL + url,
      {
		  headers: this.headers,
		  search: data
	  }
	)
  }

  // A simple POST request to an URL of the API
  // url is relative to /api/
  // Returns an observable containing the response
  postJson(url: string, data: any): Observable<Response> {
    return this.http.post(
      url,
      JSON.stringify(data),
      {headers: this.headers}
    )
  }
  
  getOrders(): Observable<any> {
	  return this.orderEmitter;
  }
  
  sendCommandLine(host: Host): void {
	    var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'RUN',
			args:  {cmdline: host.cmdline}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson("send-order.php", orderLoad	).subscribe();
  }
  
  sendKillOrder(host: Host, cmdId: string): void {
	    var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'KILL',
			args:  {cmdId: cmdId}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson("send-order.php", orderLoad	).subscribe();
  }
	
  sendUnregister(host: Host, service: Service): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'UNREGISTER',
			args: {serviceId: service.id}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson("send-order.php", orderLoad	).subscribe();
  }
	
  sendRegister(host: Host, serviceId: string, cmdline: string): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'REGISTER',
			args: {id:serviceId, cmdline: cmdline}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson("send-order.php", orderLoad	).subscribe();
  }
	
}