import {Observable} from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';

import { Host, Service } from '../_models/objects';
import { Order } from '../_models/comm/order';
import { generateUUID } from '../_helpers/utils';

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
		if (!host.client_id) throw ("client-id for host must be known !");
	    var orderLoad = Order.buildOrderLoad('CMD', host, args);
		this.orderEmitter.emit( orderLoad );
		this.httpInterceptorService.postJson("send-order.php", orderLoad ).subscribe();
  }
  
  // Send an order to a client with a given ID. The caller wants to read the result of this order
  // using the given ID, so this order is not registered to the orderEmitter observable
  sendOrderWithId(host: Host, id: string, args: any): void {
		if (!host.client_id) throw ("client-id for host must be known !");
	    var orderLoad = Order.buildOrderLoadWithId('CMD', host, args, id);
		this.httpInterceptorService.postJson("send-order.php", orderLoad ).subscribe();
  }
  
  // Uses this.sendOrder() to send a RUN command
  // TODO : Attention, il faut fournir le client-id dans l'attribut host.client_id (cf Order).
  sendCommandLine(host: Host): void {
	  if (!host.client_id) throw ("client-id for host must be known !");
	  this.sendOrder(host, {
			cmd: 'RUN',
			args:  {cmdline: host.cmdline}
		});
  }
  
  // Uses this.sendOrderWithId() to send a RUN command
  // TODO : Attention, il faut fournir le client-id dans l'attribut host.client_id (cf Order).
  sendCommandLineWithId(host: Host, id: string, cmdline: string): void {
      if (!host.client_id) throw ("client-id for host must be known !");
	  this.sendOrderWithId(host, id, {
			cmd: 'RUN',
			args:  {cmdline: cmdline}
		});
  }
  
  // Uses this.sendOrder() to send a KILL command
  // TODO : Attention, il faut fournir le client-id dans l'attribut host.client_id (cf Order).
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