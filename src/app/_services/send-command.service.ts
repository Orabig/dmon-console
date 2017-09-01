import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';

import { Host, Service } from '../_models/objects';
import { Order } from '../_models/comm/order';

import { HttpInterceptorService } from './http-interceptor.service';

// Le service qui envoie des commandes au serveur

// TODO : reutiliser ce service pour envoyer la commande dans host.service

@Injectable()
export class SendCommandService {
  
  constructor(private httpInterceptorService: HttpInterceptorService) {}
  
  orderEmitter = new EventEmitter<any>();

  // An observable that emits all orders sent to the clients.  
  getOrders(): Observable<any> {
	  return this.orderEmitter;
  }
  
  // Send an order to a client
  sendOrder(host: Host, args: any): void {
	    var orderLoad = Order.buildOrderLoad('CMD', host, args);
		console.log("Emit>>>>",orderLoad);
		this.orderEmitter.emit( orderLoad );
		this.httpInterceptorService.postJson("send-order.php", orderLoad ).subscribe();
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