import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import { Host } from './host';
import { Service } from './service';
import { Order } from './order';

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
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe(response=>console.log(response));
  }
	
  sendUnregister(host: Host, service: Service): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'UNREGISTER',
			args: {serviceId: service.name}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe(response=>console.log(response));
  }
	
  registerService(host: Host, name: string, cmdline: string): void {
		var orderLoad = Order.buildOrderLoad('CMD', host, {		
			cmd: 'REGISTER',
			args: {cmdline: cmdline}
		});
		this.orderEmitter.emit( orderLoad );
		this.postJson(this.baseApiURL + "send-order.php", orderLoad	).subscribe(response=>console.log(response));
  }
	
}