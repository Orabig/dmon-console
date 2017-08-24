import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import { Host } from '../model/host';
import { Service } from '../model/service';
import { Order } from '../model/order';

// Le service qui envoie des commandes au serveur

// TODO : reutiliser ce service pour envoyer la commande dans host.service

@Injectable()
export class SendCommandService {
  private baseApiURL = 'http://centrifugo.crocoware.com:9191/api/';
  
  constructor(private http: Http) {}
  
  orderEmitter = new EventEmitter<any>();

  
  headers = new Headers({
    'Content-Type': 'application/json'
  });

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
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe();
  }
  
  sendKillOrder(host: Host, cmdId: string): void {
	    var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'KILL',
			args:  {cmdId: cmdId}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe();
  }
	
  sendUnregister(host: Host, service: Service): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'UNREGISTER',
			args: {serviceId: service.id}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe();
  }
	
  sendRegister(host: Host, serviceId: string, cmdline: string): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'REGISTER',
			args: {id:serviceId, cmdline: cmdline}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe();
  }
	
}